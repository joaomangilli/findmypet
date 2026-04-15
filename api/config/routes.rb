Rails.application.routes.draw do
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
