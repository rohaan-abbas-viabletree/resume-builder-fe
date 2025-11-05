export interface IOrderType {
  key: string;
  product: string;
  productName: string;
  altName: string;
  packageType: string;
  noOfBox: number | undefined;
  remainingBoxes: number | undefined;
  netWeightPerBox: number;
  grossWeightPerBox: number;
  totalNetWeight: number;
  totalGrossWeight: number;
  productRate: number;
  totalAmount: number;
  loadingCharges?: number;
  totalAmountWithLoadingCharges?: number;
  origin: string;
  no_of_package_per_box: number;
  package_name: number;
  package_type?: string;
  weight_unit_label: string;
  weight_unit: string;
  mrpPricePerMetricTon?: number | string;
  value_in_kilogram?: number;
  originalProduct?: string;
}

export type CountType = {
  id: string;
  invoices?: {
    id: string;
    containers: { id: string; products: { id: string }[] }[];
  }[];
};

export interface TransportFields {
  key: string;
  vessel_name?: string;
  container_no: string;
  documentId: string;
  product_details?: string[] | null;
  seal_no: string;
  bl_no: string;
  transport_from?: string;
  transport_to?: string;
  transport_from_label?: string;
  transport_to_label?: string;
  total_no_of_box: number;
  order_no?: string[] | null;
  invoice_no: string;
  vehicle_no: string;
  trailer_no: string;
  dbw_ref: string;
  booking_ref: string;
  out_token: string;
  out_token_date: string;
  in_token: string;
  in_token_date: string;
  acceptance_no: string;
  acceptance_dpw_no: string;
  vessel?: string | null;
}

export type SelectOption = {
  label: string;
  value: string;
};
