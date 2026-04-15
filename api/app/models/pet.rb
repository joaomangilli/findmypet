class Pet < ApplicationRecord
  belongs_to :user
  has_many :announcements, dependent: :destroy
  has_many_attached :photos

  validates :name,    presence: true
  validates :species, presence: true, inclusion: { in: %w[dog cat bird rabbit other] }

  SPECIES_LABELS = {
    "dog"    => "Cachorro",
    "cat"    => "Gato",
    "bird"   => "Pássaro",
    "rabbit" => "Coelho",
    "other"  => "Outro"
  }.freeze
end
