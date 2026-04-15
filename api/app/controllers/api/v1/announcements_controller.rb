module Api
  module V1
    class AnnouncementsController < ApplicationController
      before_action :authenticate_user!, only: [ :create, :update ]
      before_action :set_announcement, only: [ :show, :update ]

      # GET /api/v1/announcements
      def index
        announcements = Announcement.active
                                    .includes(:pet, :user)
                                    .order(created_at: :desc)
                                    .limit(50)

        render_success(announcements.map { |a| announcement_summary(a) })
      end

      # GET /api/v1/announcements/:id
      def show
        render_success(announcement_detail(@announcement))
      end

      # POST /api/v1/announcements
      def create
        pet = build_or_find_pet
        return unless pet

        announcement = current_user.announcements.build(
          announcement_params.merge(pet: pet)
        )

        if params[:lat].present? && params[:lng].present?
          announcement.last_seen_location = "POINT(#{params[:lng]} #{params[:lat]})"
        end

        if announcement.save
          SendAnnouncementNotificationsJob.perform_later(announcement.id)
          render_success(announcement_detail(announcement), status: :created)
        else
          render_error(announcement.errors.full_messages.join(", "))
        end
      end

      # PUT /api/v1/announcements/:id
      def update
        unless @announcement.user_id == current_user.id
          return render_error("Sem permissão", status: :forbidden)
        end

        if @announcement.update(update_params)
          render_success(announcement_detail(@announcement))
        else
          render_error(@announcement.errors.full_messages.join(", "))
        end
      end

      private

      def set_announcement
        @announcement = Announcement.includes(:pet, :user, :sightings).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error("Anúncio não encontrado", status: :not_found)
      end

      def build_or_find_pet
        if params[:pet_id].present?
          pet = current_user.pets.find_by(id: params[:pet_id])
          render_error("Pet não encontrado", status: :not_found) unless pet
          pet
        else
          pet = current_user.pets.build(pet_params)
          unless pet.save
            render_error(pet.errors.full_messages.join(", "))
            return nil
          end
          pet
        end
      end

      def announcement_params
        params.permit(:description, :last_seen_address, :last_seen_at, :notification_radius_km)
      end

      def update_params
        params.permit(:status, :description)
      end

      def pet_params
        params.require(:pet).permit(:name, :species, :breed, :color, :description)
      end

      def announcement_summary(a)
        {
          id: a.id,
          status: a.status,
          last_seen_address: a.last_seen_address,
          last_seen_at: a.last_seen_at,
          created_at: a.created_at,
          lat: a.last_seen_location&.y,
          lng: a.last_seen_location&.x,
          pet: pet_json(a.pet),
          owner: { id: a.user.id, name: a.user.name }
        }
      end

      def announcement_detail(a)
        announcement_summary(a).merge(
          description: a.description,
          notification_radius_km: a.notification_radius_km,
          sightings_count: a.sightings.size,
          sightings: a.sightings.map { |s| sighting_json(s) }
        )
      end

      def pet_json(pet)
        {
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          color: pet.color,
          description: pet.description,
          photos: pet.photos.map { |p| Rails.application.routes.url_helpers.rails_blob_url(p, only_path: true) }
        }
      end

      def sighting_json(s)
        {
          id: s.id,
          saw_it: s.saw_it,
          reporter_name: s.user&.name || s.reporter_name,
          address: s.address,
          description: s.description,
          seen_at: s.seen_at,
          lat: s.location&.y,
          lng: s.location&.x,
          created_at: s.created_at
        }
      end
    end
  end
end
