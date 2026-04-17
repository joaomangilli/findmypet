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
    invalid_phones = [
      "abc",              # letras
      "11999000001",      # sem +55
      "+5511999000",      # curto demais (8 dígitos após DDD)
      "+551199900000099", # longo demais
      "+5511 9999 00001", # formatado (não normalizado)
      "+551099900001"    # DDD começando com 0
    ]
    invalid_phones.each do |phone|
      user = build(:user, phone: phone)
      assert_not user.valid?, "esperava que #{phone.inspect} fosse inválido"
      assert_includes user.errors[:phone],
                      "deve ser um celular brasileiro válido (+55 DDD 9XXXX-XXXX)",
                      "mensagem errada para #{phone.inspect}"
    end
  end

  test "valid with correct brazilian phone" do
    valid_phones = [
      "+5511999000001",   # SP
      "+5521987654321",   # RJ
      "+5531900000001"   # BH
    ]
    valid_phones.each do |phone|
      user = build(:user, phone: phone)
      assert user.valid?, "esperava que #{phone.inspect} fosse válido: #{user.errors[:phone].inspect}"
    end
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
