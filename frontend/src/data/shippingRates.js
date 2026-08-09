// أسعار التوصيل ومدده لكل محافظة + خصم أول طلب
// القاعدة: المحافظات اللي سعرها العادي 60 ج.م بتبقى ببلاش لأول طلب،
// والباقي بيتخصم منه 60 ج.م بالظبط لأول طلب بس.

const RAW_RATES = {
  cairo: 60,
  giza: 60,
  alexandria: 60,
  qalyubia: 60,
  sharqia: 60,

  dakahlia: 70,
  beheira: 70,
  gharbia: 70,
  monufia: 70,
  damietta: 70,
  kafrElSheikh: 70,

  ismailia: 75,
  portSaid: 75,

  suez: 80,
  beniSuef: 80,

  asyut: 85,
  fayoum: 85,
  minya: 85,

  aswan: 110,
  redSea: 110,
  sohag: 110,
  qena: 110,

  luxor: 115,

  newValley: 125,
  southSinai: 125,
  northSinai: 125,
  matrouh: 125,
}

// مدة التوصيل حسب شريحة السعر
function daysForPrice(price) {
  if (price === 60) return [2, 6]
  if (price === 115 || price === 125) return [3, 10]
  return [2, 8] // 70, 75, 80, 85, 110
}

// جدول جاهز لكل محافظة: السعر العادي + سعر أول طلب + مدة التوصيل
export const SHIPPING_RATES = Object.fromEntries(
  Object.entries(RAW_RATES).map(([key, price]) => [
    key,
    {
      price,
      firstOrderPrice: price === 60 ? 0 : price - 60,
      days: daysForPrice(price),
    },
  ])
)

// بترجع تفاصيل الشحن لمحافظة معينة، مع مراعاة لو ده أول طلب للعميل
// governorateKey: المفتاح زي "cairo"، isFirstOrder: true/false
export function getShippingQuote(governorateKey, isFirstOrder) {
  const rate = SHIPPING_RATES[governorateKey]
  if (!rate) return null

  const price = isFirstOrder ? rate.firstOrderPrice : rate.price
  return {
    price,
    originalPrice: rate.price,
    isDiscounted: isFirstOrder,
    isFree: price === 0,
    daysMin: rate.days[0],
    daysMax: rate.days[1],
  }
}