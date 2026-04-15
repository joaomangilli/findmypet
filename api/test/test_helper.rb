ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "webmock/minitest"

module ActiveSupport
  class TestCase
    include FactoryBot::Syntax::Methods

    # Run tests serially to avoid pg connection segfaults on macOS ARM
    parallelize(workers: 1)

    # Block all real HTTP requests in tests
    WebMock.disable_net_connect!(allow_localhost: true)
  end
end

# Helper to generate a JWT token for a given user in request tests
module AuthHelpers
  def auth_headers(user)
    token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
    { "Authorization" => "Bearer #{token}", "Content-Type" => "application/json" }
  end
end

module ActionDispatch
  class IntegrationTest
    include AuthHelpers
  end
end
