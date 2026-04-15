require "test_helper"

class OtpCodeTest < ActiveSupport::TestCase
  test "generate_for creates a 6-digit code" do
    otp = OtpCode.generate_for("+5511999000001")
    assert_match(/\A\d{6}\z/, otp.code)
  end

  test "generate_for expires in 10 minutes" do
    otp = OtpCode.generate_for("+5511999000002")
    assert_in_delta 10.minutes.from_now.to_i, otp.expires_at.to_i, 5
  end

  test "generate_for invalidates previous unused codes for same phone" do
    phone = "+5511999000003"
    old = OtpCode.generate_for(phone)
    _new = OtpCode.generate_for(phone)
    assert_raises(ActiveRecord::RecordNotFound) { old.reload }
  end

  test "valid_for returns only unused, unexpired codes" do
    phone = "+5511999000004"
    valid = create(:otp_code, phone: phone, expires_at: 5.minutes.from_now, used: false)
    _used = create(:otp_code, phone: phone, expires_at: 5.minutes.from_now, used: true)
    _expired = create(:otp_code, phone: phone, expires_at: 5.minutes.ago, used: false)

    results = OtpCode.valid_for(phone)
    assert_includes results, valid
    assert_equal 1, results.count
  end

  test "use! marks code as used" do
    otp = create(:otp_code, used: false)
    otp.use!
    assert otp.reload.used?
  end
end
