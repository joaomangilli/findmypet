require "test_helper"

module Api
  module V1
    class AuthControllerTest < ActionDispatch::IntegrationTest
      setup do
        @phone = "+5511999000099"
        # Stub Evolution API so no real HTTP is made
        stub_request(:post, /evolution-api|localhost:8080/)
          .to_return(status: 200, body: '{"key":{"id":"stub"}}', headers: { "Content-Type" => "application/json" })
      end

      # POST /api/v1/auth/send_otp
      test "send_otp returns 200 and creates OtpCode" do
        assert_difference "OtpCode.count", 1 do
          post "/api/v1/auth/send_otp", params: { phone: @phone }.to_json,
               headers: { "Content-Type" => "application/json" }
        end
        assert_response :ok
        assert_match @phone, JSON.parse(response.body)["message"]
      end

      test "send_otp returns error without phone" do
        post "/api/v1/auth/send_otp", params: {}.to_json,
             headers: { "Content-Type" => "application/json" }
        assert_response :unprocessable_entity
      end

      # POST /api/v1/auth/verify_otp
      test "verify_otp returns JWT token for existing user" do
        user = create(:user, phone: @phone)
        otp  = OtpCode.generate_for(@phone)

        post "/api/v1/auth/verify_otp",
             params: { phone: @phone, code: otp.code }.to_json,
             headers: { "Content-Type" => "application/json" }

        assert_response :ok
        body = JSON.parse(response.body)
        assert body["token"].present?
        assert_equal user.id, body["user"]["id"]
      end

      test "verify_otp creates new user on first login" do
        otp = OtpCode.generate_for(@phone)

        assert_difference "User.count", 1 do
          post "/api/v1/auth/verify_otp",
               params: { phone: @phone, code: otp.code, name: "Ana" }.to_json,
               headers: { "Content-Type" => "application/json" }
        end

        assert_response :ok
        assert_equal "Ana", User.find_by(phone: @phone).name
      end

      test "verify_otp returns 401 for wrong code" do
        OtpCode.generate_for(@phone)

        post "/api/v1/auth/verify_otp",
             params: { phone: @phone, code: "000000" }.to_json,
             headers: { "Content-Type" => "application/json" }

        assert_response :unauthorized
      end

      test "verify_otp returns 401 for expired code" do
        otp = create(:otp_code, phone: @phone, expires_at: 1.minute.ago)

        post "/api/v1/auth/verify_otp",
             params: { phone: @phone, code: otp.code }.to_json,
             headers: { "Content-Type" => "application/json" }

        assert_response :unauthorized
      end
    end
  end
end
