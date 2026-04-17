Rails.application.routes.draw do
  # Swagger UI — página raiz da API
  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"

  # Sidekiq Web UI (protegido por Basic Auth em produção)
  require "sidekiq/web"
  if Rails.env.production?
    Sidekiq::Web.use Rack::Auth::Basic do |user, password|
      ActiveSupport::SecurityUtils.secure_compare(
        ::Digest::SHA256.hexdigest(user),
        ::Digest::SHA256.hexdigest(ENV.fetch("SIDEKIQ_WEB_USER", "admin"))
      ) &
      ActiveSupport::SecurityUtils.secure_compare(
        ::Digest::SHA256.hexdigest(password),
        ::Digest::SHA256.hexdigest(ENV.fetch("SIDEKIQ_WEB_PASSWORD", SecureRandom.hex))
      )
    end
  end
  mount Sidekiq::Web => "/sidekiq"

  root to: redirect("/api-docs")

  get "up" => "rails/health#show", as: :rails_health_check

  # Registra o mapeamento Devise para :user sem expor rotas Devise padrão
  devise_for :users, skip: :all

  namespace :api do
    namespace :v1 do
      # Auth
      post "auth/send_otp",    to: "auth#send_otp"
      post "auth/verify_otp",  to: "auth#verify_otp"
      delete "auth/sign_out",  to: "auth#sign_out"

      # Current user (requires auth)
      get  "me", to: "users#show"
      put  "me", to: "users#update"

      # Subscribers (public)
      resources :subscribers, only: [ :create, :update, :destroy ]

      # Announcements
      resources :announcements, only: [ :index, :show, :create, :update ] do
        resources :sightings, only: [ :index, :create ]
      end
    end
  end
end
