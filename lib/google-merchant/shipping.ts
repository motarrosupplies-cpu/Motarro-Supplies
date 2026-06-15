import { GMC_STANDARD_SHIPPING_ZAR } from "@/lib/google-merchant/local-inventory";

export function formatGmcShippingPrice(): string {
  return `${GMC_STANDARD_SHIPPING_ZAR.toFixed(2)} ZAR`;
}

export function buildGmcShippingXml(): string {
  return `<g:shipping>
      <g:country>ZA</g:country>
      <g:service>Standard</g:service>
      <g:price>${formatGmcShippingPrice()}</g:price>
    </g:shipping>`;
}
