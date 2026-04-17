FactoryBot.define do
  factory :user do
    sequence(:phone) { |n| "+5511999#{n.to_s.rjust(6, "0")}" }
    name { Faker::Name.first_name }
    password { "secret123" }
    jti { SecureRandom.uuid }
  end
end
