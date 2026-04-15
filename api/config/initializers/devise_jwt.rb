Devise::JWT.configure do |config|
  config.secret = ENV.fetch("DEVISE_JWT_SECRET_KEY") { Rails.application.credentials.secret_key_base }
  config.dispatch_requests = [
    [ "POST", %r{^/api/v1/auth/verify_otp$} ]
  ]
  config.revocation_requests = [
    [ "DELETE", %r{^/api/v1/auth/sign_out$} ]
  ]
end
