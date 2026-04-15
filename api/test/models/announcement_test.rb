require "test_helper"

class AnnouncementTest < ActiveSupport::TestCase
  test "valid with required fields" do
    assert build(:announcement).valid?
  end

  test "invalid without description" do
    assert_not build(:announcement, description: nil).valid?
  end

  test "invalid without last_seen_at" do
    assert_not build(:announcement, last_seen_at: nil).valid?
  end

  test "invalid notification_radius_km of zero" do
    assert_not build(:announcement, notification_radius_km: 0).valid?
  end

  test "defaults to active status" do
    a = create(:announcement)
    assert a.active?
  end

  test "can transition to found" do
    a = create(:announcement)
    a.found!
    assert a.found?
  end

  test "active scope returns only active announcements" do
    active = create(:announcement, status: :active)
    found  = create(:announcement, status: :found)
    assert_includes Announcement.active, active
    assert_not_includes Announcement.active, found
  end
end
