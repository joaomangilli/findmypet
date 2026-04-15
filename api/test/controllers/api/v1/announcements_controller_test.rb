require "test_helper"

module Api
  module V1
    class AnnouncementsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user         = create(:user)
        @other_user   = create(:user)
        @pet          = create(:pet, user: @user)
        @announcement = create(:announcement, user: @user, pet: @pet)
      end

      # GET /api/v1/announcements
      test "index returns active announcements without auth" do
        get "/api/v1/announcements"
        assert_response :ok
        ids = JSON.parse(response.body).map { |a| a["id"] }
        assert_includes ids, @announcement.id
      end

      test "index does not include found announcements" do
        @announcement.found!
        get "/api/v1/announcements"
        assert_response :ok
        ids = JSON.parse(response.body).map { |a| a["id"] }
        assert_not_includes ids, @announcement.id
      end

      # GET /api/v1/announcements/:id
      test "show returns announcement detail without auth" do
        get "/api/v1/announcements/#{@announcement.id}"
        assert_response :ok
        body = JSON.parse(response.body)
        assert_equal @announcement.id, body["id"]
        assert body.key?("sightings")
      end

      test "show returns 404 for unknown id" do
        get "/api/v1/announcements/999999"
        assert_response :not_found
      end

      # POST /api/v1/announcements
      test "create requires authentication" do
        post "/api/v1/announcements",
             params: announcement_payload.to_json,
             headers: { "Content-Type" => "application/json" }
        assert_response :unauthorized
      end

      test "create builds pet and announcement when authenticated" do
        assert_difference [ "Announcement.count", "Pet.count" ], 1 do
          post "/api/v1/announcements",
               params: announcement_payload.to_json,
               headers: auth_headers(@user)
        end
        assert_response :created
        body = JSON.parse(response.body)
        assert_equal "Rex", body["pet"]["name"]
      end

      test "create enqueues notification job" do
        assert_enqueued_with(job: SendAnnouncementNotificationsJob) do
          post "/api/v1/announcements",
               params: announcement_payload.to_json,
               headers: auth_headers(@user)
        end
      end

      # PUT /api/v1/announcements/:id
      test "update allows owner to change status to found" do
        put "/api/v1/announcements/#{@announcement.id}",
            params: { status: "found" }.to_json,
            headers: auth_headers(@user)
        assert_response :ok
        assert @announcement.reload.found?
      end

      test "update forbids non-owner" do
        put "/api/v1/announcements/#{@announcement.id}",
            params: { status: "found" }.to_json,
            headers: auth_headers(@other_user)
        assert_response :forbidden
      end

      test "update requires authentication" do
        put "/api/v1/announcements/#{@announcement.id}",
            params: { status: "found" }.to_json,
            headers: { "Content-Type" => "application/json" }
        assert_response :unauthorized
      end

      private

      def announcement_payload
        {
          description: "Sumiu ontem à noite.",
          last_seen_address: "Rua das Flores, 100",
          last_seen_at: 2.hours.ago.iso8601,
          notification_radius_km: 5,
          lat: -23.548943,
          lng: -46.633308,
          pet: { name: "Rex", species: "dog", breed: "Poodle", color: "branco" }
        }
      end
    end
  end
end
