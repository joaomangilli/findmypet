class ApplicationController < ActionController::API
  before_action :configure_permitted_parameters, if: :devise_controller?

  respond_to :json

  # Opcional: define current_user sem exigir auth
  def current_user
    @current_user ||= request.env["warden"].authenticate(scope: :user)
  rescue StandardError
    nil
  end

  # Obrigatório para before_action :authenticate_user! em API-only apps
  # (ActionController::API não inclui os helpers do Devise automaticamente)
  def authenticate_user!
    render_error("Não autorizado", status: :unauthorized) unless current_user
  end

  private

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :phone, :name ])
    devise_parameter_sanitizer.permit(:account_update, keys: [ :phone, :name ])
  end

  def render_error(message, status: :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_success(data = {}, status: :ok)
    render json: data, status: status
  end
end
