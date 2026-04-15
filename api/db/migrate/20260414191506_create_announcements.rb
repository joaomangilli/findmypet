class CreateAnnouncements < ActiveRecord::Migration[8.1]
  def change
    create_table :announcements do |t|
      t.references :pet,  null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer  :status,                   null: false, default: 0
      t.column   :last_seen_location, :geography, geographic: true, srid: 4326, limit: { type: "Point" }
      t.string   :last_seen_address
      t.datetime :last_seen_at
      t.text     :description
      t.integer  :notification_radius_km,   null: false, default: 5

      t.timestamps
    end

    add_index :announcements, :status
    add_index :announcements, :last_seen_location, using: :gist
  end
end
