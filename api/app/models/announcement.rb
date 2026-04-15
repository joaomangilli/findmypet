class Announcement < ApplicationRecord
  belongs_to :pet
  belongs_to :user
  has_many :sightings, dependent: :destroy
  has_many :whatsapp_notifications, dependent: :destroy

  enum :status, { active: 0, found: 1, closed: 2 }

  validates :description, presence: true
  validates :last_seen_at, presence: true
  validates :notification_radius_km, numericality: { greater_than: 0, less_than_or_equal_to: 100 }

  scope :active_near, ->(lat, lng, radius_km = 20) {
    active.order(created_at: :desc)
  }
end
