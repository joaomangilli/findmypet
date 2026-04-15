require "test_helper"

class SightingTest < ActiveSupport::TestCase
  test "valid with reporter_name and no user" do
    assert build(:sighting, user: nil, reporter_name: "Maria").valid?
  end

  test "valid with user and no reporter_name" do
    user = create(:user)
    assert build(:sighting, user: user, reporter_name: nil).valid?
  end

  test "invalid without user and without reporter_name" do
    sighting = build(:sighting, user: nil, reporter_name: nil)
    assert_not sighting.valid?
    assert_includes sighting.errors[:base], "Informe seu nome para reportar"
  end

  test "saw_it defaults to true" do
    s = create(:sighting)
    assert s.saw_it
  end

  test "saw_it can be false" do
    assert build(:sighting, saw_it: false).valid?
  end
end
