FactoryBot.define do
  factory :announcement do
    association :pet
    association :user
    status                { :active }
    last_seen_address     { Faker::Address.full_address }
    last_seen_at          { 2.hours.ago }
    description           { "O pet sumiu perto do parque." }
    notification_radius_km { 5 }
    last_seen_location    { "POINT(-46.633308 -23.548943)" }
  end
end
