require "test_helper"

class SubscriberTest < ActiveSupport::TestCase
  test "valid with all required fields" do
    assert build(:subscriber).valid?
  end

  test "invalid without phone" do
    assert_not build(:subscriber, phone: nil).valid?
  end

  test "invalid without name" do
    assert_not build(:subscriber, name: nil).valid?
  end

  test "invalid with duplicate phone" do
    create(:subscriber, phone: "+5521888000001")
    assert_not build(:subscriber, phone: "+5521888000001").valid?
  end

  test "invalid notification_radius_km of zero" do
    assert_not build(:subscriber, notification_radius_km: 0).valid?
  end

  test "invalid notification_radius_km over 100" do
    assert_not build(:subscriber, notification_radius_km: 101).valid?
  end

  test "within_radius returns subscribers inside the radius" do
    # São Paulo ~(-23.548943, -46.633308)
    near = create(:subscriber, lat: -23.549, lng: -46.634, notification_radius_km: 5)
    _far = create(:subscriber, lat: -22.900, lng: -43.172, notification_radius_km: 5)

    results = Subscriber.within_radius(-23.548943, -46.633308, 5)
    assert_includes results, near
  end

  test "within_radius excludes subscribers outside the radius" do
    _far = create(:subscriber, lat: -22.900, lng: -43.172, notification_radius_km: 5)
    results = Subscriber.within_radius(-23.548943, -46.633308, 5)
    assert_empty results
  end

  test "within_radius returns none when lat is nil" do
    create(:subscriber)
    assert_empty Subscriber.within_radius(nil, -46.633308, 5)
  end
end
