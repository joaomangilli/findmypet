module Api
  module V1
    class SubscribersController < ApplicationController
      before_action :set_subscriber, only: [ :update, :destroy ]

      # POST /api/v1/subscribers
      def create
        subscriber = Subscriber.find_or_initialize_by(phone: subscriber_params[:phone])
        subscriber.assign_attributes(subscriber_params)

        if subscriber.save
          render_success(subscriber_json(subscriber), status: :created)
        else
          render_error(subscriber.errors.full_messages.join(", "))
        end
      end

      # PUT /api/v1/subscribers/:id
      def update
        if @subscriber.update(subscriber_params)
          render_success(subscriber_json(@subscriber))
        else
          render_error(@subscriber.errors.full_messages.join(", "))
        end
      end

      # DELETE /api/v1/subscribers/:id
      def destroy
        @subscriber.destroy
        render_success({ message: "Cadastro removido com sucesso" })
      end

      private

      def set_subscriber
        @subscriber = Subscriber.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error("Cadastro não encontrado", status: :not_found)
      end

      def subscriber_params
        params.permit(:phone, :name, :address, :lat, :lng, :notification_radius_km)
      end

      def subscriber_json(s)
        {
          id: s.id,
          phone: s.phone,
          name: s.name,
          address: s.address,
          lat: s.lat,
          lng: s.lng,
          notification_radius_km: s.notification_radius_km
        }
      end
    end
  end
end
