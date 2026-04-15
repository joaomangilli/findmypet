require "test_helper"

module Api
  module V1
    class SightingsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user         = create(:user)
        @announcement = create(:announcement)
      end

      # GET /api/v1/announcements/:announcement_id/sightings
      test "index returns sightings without auth" do
        create(:sighting, announcement: @announcement, reporter_name: "João")
        get "/api/v1/announcements/#{@announcement.id}/sightings"
        assert_response :ok
        body = JSON.parse(response.body)
        assert_equal 1, body.size
        assert_equal "João", body.first["reporter_name"]
      end

      # POST /api/v1/announcements/:announcement_id/sightings
      test "create allows anonymous sighting with reporter_name" do
        assert_difference "Sighting.count", 1 do
          post "/api/v1/announcements/#{@announcement.id}/sightings",
               params: {
                 saw_it: true,
                 reporter_name: "Maria",
                 address: "Rua A, 1",
                 description: "Vi o pet correndo."
               }.to_json,
               headers: { "Content-Type" => "application/json" }
        end
        assert_response :created
      end

      test "create associates user when authenticated" do
        post "/api/v1/announcements/#{@announcement.id}/sightings",
             params: { saw_it: false, description: "Não vi." }.to_json,
             headers: auth_headers(@user)
        assert_response :created
        assert_equal @user.id, Sighting.last.user_id
      end

      test "create returns error without reporter_name and without auth" do
        post "/api/v1/announcements/#{@announcement.id}/sightings",
             params: { saw_it: true }.to_json,
             headers: { "Content-Type" => "application/json" }
        assert_response :unprocessable_entity
      end

      test "create returns 404 for unknown announcement" do
        post "/api/v1/announcements/999999/sightings",
             params: { saw_it: true, reporter_name: "X" }.to_json,
             headers: { "Content-Type" => "application/json" }
        assert_response :not_found
      end
    end
  end
end
