require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "valid with all required fields" do
    user = build(:user)
    assert user.valid?
  end

  test "invalid without phone" do
    user = build(:user, phone: nil)
    assert_not user.valid?
    assert_includes user.errors[:phone], "can't be blank"
  end

  test "invalid without name" do
    user = build(:user, name: nil)
    assert_not user.valid?
  end

  test "invalid with duplicate phone" do
    create(:user, phone: "+5511999000001")
    user = build(:user, phone: "+5511999000001")
    assert_not user.valid?
    assert_includes user.errors[:phone], "has already been taken"
  end

  test "invalid with badly formatted phone" do
    user = build(:user, phone: "abc")
    assert_not user.valid?
    assert_includes user.errors[:phone], "formato inválido"
  end

  test "has many pets" do
    user = create(:user)
    create_list(:pet, 2, user: user)
    assert_equal 2, user.pets.count
  end

  test "has many announcements" do
    user = create(:user)
    pet = create(:pet, user: user)
    create_list(:announcement, 2, user: user, pet: pet)
    assert_equal 2, user.announcements.count
  end
end
