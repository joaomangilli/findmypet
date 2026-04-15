module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!

      # GET /api/v1/me
      def show
        render_success(user_json(current_user))
      end

      # PUT /api/v1/me
      def update
        if current_user.update(user_params)
          render_success(user_json(current_user))
        else
          render_error(current_user.errors.full_messages.join(", "))
        end
      end

      private

      def user_params
        params.permit(:name)
      end

      def user_json(user)
        { id: user.id, phone: user.phone, name: user.name }
      end
    end
  end
end
