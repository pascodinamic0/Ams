export type CompanyPartner = {
  name: string;
  href?: string;
  logoSrc: string;
};

/** Add logos under public/images/partners/ - section hidden when empty. */
export const companyPartners: CompanyPartner[] = [];
