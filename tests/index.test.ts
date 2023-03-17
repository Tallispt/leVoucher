import voucherRepository from "repositories/voucherRepository"
import voucherService from "services/voucherService"

describe("Creating voucher", () => {
  it("Should respond with 'Voucher already exist.' if voucher already exists", () => {
    const code = "CODE10"

    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
      return {
        id: 1,
        code,
        discount: 10,
        used: false
      }
    })

    const promise = voucherService.createVoucher(code, 10)
    
    expect(promise).rejects.toEqual({
      message: "Voucher already exist.",
      type: "conflict"
    })
  })

  it("Should create voucher if code not exists", async () => {
    const code = "CODE10"

    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
      return undefined
    })

    jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce((): any => {
      return {
        id: 1,
        code,
        discount: 10,
        used: false
      }
    })

    const result = await voucherService.createVoucher(code, 100)

    expect(result).toEqual({
      id: 1,
      code,
      discount: 10,
      used: false
    })
  })
})

describe("Applying voucher", () => {
  it("Should respond with error voucher does not exists", () => {
    const code = "CODE10"

    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
      return undefined
    })

    const promise = voucherService.applyVoucher(code, 100)
    
    expect(promise).rejects.toEqual({
      message: "Voucher does not exist.",
      type: "conflict"
    })
  })

  it("Should respond with the same finalPrice if used is equal to true", 
  async () => {
    const voucher = {
      id: 1,
      code: "CODE10",
      discount: 10,
      used: true
    }
    const amount = 100

    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
      return voucher
    })

    const result = await voucherService.applyVoucher(voucher.code, amount)

    expect(result).toEqual({
      amount,
      discount: voucher.discount,
      finalAmount: amount,
      applied: false
    })
  })

  it("Should respond with the same finalPrice if amount lower than 100", 
  async () => {
    const voucher = {
      id: 1,
      code: "CODE10",
      discount: 10,
      used: false
    }
    const amount = 99

    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
      return voucher
    })

    const result = await voucherService.applyVoucher(voucher.code, amount)

    expect(result).toEqual({
      amount,
      discount: voucher.discount,
      finalAmount: amount,
      applied: false
    })
  })

  it("Should respond with the price with descount", 
  async () => {
    const voucher = {
      id: 1,
      code: "CODE10",
      discount: 10,
      used: false
    }
    const amount = 200

    jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => {
      return voucher
    })

    jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce((): any => {})

    const result = await voucherService.applyVoucher(voucher.code, amount)

    expect(result).toEqual({
      amount,
      discount: voucher.discount,
      finalAmount: amount - (amount * (voucher.discount / 100)),
      applied: true
    })
  })
})