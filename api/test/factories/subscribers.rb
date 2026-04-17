FactoryBot.define do
  factory :subscriber do
    sequence(:phone) { |n| "+5521988#{n.to_s.rjust(6, "0")}" }
    name { Faker::Name.name }
    address { Faker::Address.street_address }
    lat  { -23.5 + rand * 0.2 }
    lng  { -46.6 + rand * 0.2 }
    notification_radius_km { 5 }
  end
end
