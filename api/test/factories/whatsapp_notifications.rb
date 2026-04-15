FactoryBot.define do
  factory :whatsapp_notification do
    association :announcement
    association :subscriber
    status  { :pending }
    sent_at { nil }

    trait :sent do
      status  { :sent }
      sent_at { Time.current }
    end
  end
end
