require "test_helper"

class PetTest < ActiveSupport::TestCase
  test "valid with required fields" do
    assert build(:pet).valid?
  end

  test "invalid without name" do
    assert_not build(:pet, name: nil).valid?
  end

  test "invalid without species" do
    assert_not build(:pet, species: nil).valid?
  end

  test "invalid with unknown species" do
    assert_not build(:pet, species: "dragon").valid?
  end

  test "valid for all accepted species" do
    %w[dog cat bird rabbit other].each do |species|
      assert build(:pet, species: species).valid?, "#{species} should be valid"
    end
  end

  test "breed and color are optional" do
    assert build(:pet, breed: nil, color: nil).valid?
  end
end
