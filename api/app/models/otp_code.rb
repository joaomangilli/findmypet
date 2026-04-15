class OtpCode < ApplicationRecord
  validates :phone, :code, :expires_at, presence: true

  scope :valid_for, ->(phone) {
    where(phone: phone, used: false)
      .where("expires_at > ?", Time.current)
      .order(created_at: :desc)
  }

  def self.generate_for(phone)
    where(phone: phone, used: false).delete_all
    create!(
      phone: phone,
      code: rand(100_000..999_999).to_s,
      expires_at: 10.minutes.from_now,
      used: false
    )
  end

  def use!
    update!(used: true)
  end
end
