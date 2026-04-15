class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable,
         :registerable,
         :jwt_authenticatable,
         jwt_revocation_strategy: self

  has_many :pets,          dependent: :destroy
  has_many :announcements, dependent: :destroy
  has_many :sightings,     dependent: :nullify

  validates :phone, presence: true, uniqueness: true,
                    format: { with: /\A\+?[1-9]\d{7,14}\z/, message: "formato inválido" }
  validates :name, presence: true

  def email
    phone
  end

  def email=(value)
    self.phone = value
  end

  # Devise dirty-tracking helpers — email is an alias for phone
  def will_save_change_to_email?
    will_save_change_to_phone?
  end

  def saved_change_to_email?
    saved_change_to_phone?
  end
end
