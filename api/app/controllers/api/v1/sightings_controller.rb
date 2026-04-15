module Api
  module V1
    class SightingsController < ApplicationController
      before_action :set_announcement

      # GET /api/v1/announcements/:announcement_id/sightings
      def index
        sightings = @announcement.sightings.order(created_at: :desc)
        render_success(sightings.map { |s| sighting_json(s) })
      end

      # POST /api/v1/announcements/:announcement_id/sightings
      def create
        sighting = @announcement.sightings.build(sighting_params)

        # Se estiver logado, associa o usuário; senão, exige nome
        if current_user
          sighting.user = current_user
        end

        if params[:lat].present? && params[:lng].present?
          sighting.location = "POINT(#{params[:lng]} #{params[:lat]})"
        end

        if sighting.save
          render_success(sighting_json(sighting), status: :created)
        else
          render_error(sighting.errors.full_messages.join(", "))
        end
      end

      private

      def set_announcement
        @announcement = Announcement.find(params[:announcement_id])
      rescue ActiveRecord::RecordNotFound
        render_error("Anúncio não encontrado", status: :not_found)
      end

      def sighting_params
        params.permit(:saw_it, :reporter_name, :reporter_phone, :address, :description, :seen_at)
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
