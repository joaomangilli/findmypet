FactoryBot.define do
  factory :sighting do
    association :announcement
    user          { nil }
    reporter_name { Faker::Name.first_name }
    reporter_phone { nil }
    saw_it        { true }
    address       { Faker::Address.street_address }
    description   { "Vi o animal perto da praça." }
    seen_at       { 1.hour.ago }
  end
end
