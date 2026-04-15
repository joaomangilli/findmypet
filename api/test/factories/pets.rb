FactoryBot.define do
  factory :pet do
    association :user
    name    { Faker::Creature::Animal.name.capitalize }
    species { "dog" }
    breed   { "Labrador" }
    color   { "caramelo" }
    description { "Pet muito dócil e brincalhão." }
  end
end
