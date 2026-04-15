FactoryBot.define do
  factory :otp_code do
    sequence(:phone) { |n| "+5511777#{n.to_s.rjust(5, "0")}" }
    code       { rand(100_000..999_999).to_s }
    expires_at { 10.minutes.from_now }
    used       { false }
  end
end
