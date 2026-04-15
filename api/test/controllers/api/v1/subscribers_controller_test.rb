require "test_helper"

module Api
  module V1
    class SubscribersControllerTest < ActionDispatch::IntegrationTest
      # POST /api/v1/subscribers
      test "create registers a new subscriber" do
        assert_difference "Subscriber.count", 1 do
          post "/api/v1/subscribers",
               params: {
                 phone: "+5511988000001",
                 name: "Carlos",
                 address: "Rua A, 100",
                 lat: -23.548,
                 lng: -46.633,
                 notification_radius_km: 10
               }.to_json,
               headers: { "Content-Type" => "application/json" }
        end
        assert_response :created
        body = JSON.parse(response.body)
        assert_equal "Carlos", body["name"]
        assert_equal 10, body["notification_radius_km"]
      end

      test "create updates existing subscriber with same phone" do
        existing = create(:subscriber, phone: "+5511988000002", name: "Velha")
        assert_no_difference "Subscriber.count" do
          post "/api/v1/subscribers",
               params: { phone: "+5511988000002", name: "Nova", address: "Rua B" }.to_json,
               headers: { "Content-Type" => "application/json" }
        end
        assert_equal "Nova", existing.reload.name
      end

      test "create returns error without required fields" do
        post "/api/v1/subscribers",
             params: { phone: "+5511988000003" }.to_json,
             headers: { "Content-Type" => "application/json" }
        assert_response :unprocessable_entity
      end

      # PUT /api/v1/subscribers/:id
      test "update changes subscriber data" do
        sub = create(:subscriber)
        put "/api/v1/subscribers/#{sub.id}",
            params: { notification_radius_km: 15 }.to_json,
            headers: { "Content-Type" => "application/json" }
        assert_response :ok
        assert_equal 15, sub.reload.notification_radius_km
      end

      test "update returns 404 for unknown subscriber" do
        put "/api/v1/subscribers/999999",
            params: { notification_radius_km: 10 }.to_json,
            headers: { "Content-Type" => "application/json" }
        assert_response :not_found
      end

      # DELETE /api/v1/subscribers/:id
      test "destroy removes subscriber" do
        sub = create(:subscriber)
        assert_difference "Subscriber.count", -1 do
          delete "/api/v1/subscribers/#{sub.id}"
        end
        assert_response :ok
      end
    end
  end
end
