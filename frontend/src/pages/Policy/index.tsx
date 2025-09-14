import { FunctionComponent } from 'react';

interface PolicyPageProps {}

const PolicyPage: FunctionComponent<PolicyPageProps> = () => {
  return (
    <div className="mx-auto mb-10 w-full px-3 md:w-[1100px] md:px-[90px]">
      <main className="mt-20">
        <h1 className="mb-5 text-[18px] font-bold leading-[21px] text-mainV1 md:mb-10 md:text-[36px] md:leading-[48px]">
          Restricted Regions Policy
        </h1>
        <div className="rounded-2xl border-2 border-[#7B61FF] p-4 text-sm font-normal text-[#666] md:p-10 md:text-[20px]">
          <p className="mt-[10px] leading-[17px] md:leading-[30px]">
            The use of the Website or any of the Services for any form of
            illicit activity, including money laundering, terrorist financing or
            trade sanctions violations, is prohibited.
          </p>
          <p className="mt-[10px] leading-[17px] md:leading-[30px]">
            Any attempt to conceal your true location through the use of a VPN,
            proxy, or similar service or through the provision of incorrect or
            misleading information about your place of residence or location
            will constitute a breach of these Terms of Service.
          </p>
          <section>
            <h1 className="mt-6 font-bold leading-[17px] md:leading-[42px]">
              Usage Rules
            </h1>
            <div className="mt-[10px]">
              <ul className="list-disc space-y-4 pl-5 leading-[17px] marker:text-base md:leading-[30px]">
                <li>
                  At Sortes, we strive to comply with local laws and regulations
                  in every region we operate. Unfortunately, our products and
                  services are not accessible in certain locations due to legal
                  restrictions or licensing requirements.
                </li>
                <li>
                  If you are seeing the [Access Restricted Notice], it means
                  that your current IP address indicates you are accessing the
                  platform from a restricted region.
                </li>
              </ul>
            </div>
          </section>
          <section>
            <h1 className="mt-6 font-bold leading-[17px] md:leading-[42px]">
              What can you do?
            </h1>
            <div className="mt-[10px]">
              <ul className="list-disc space-y-4 pl-5 leading-[17px] marker:text-base md:leading-[30px]">
                <li>
                  Ensure you are not using a VPN or proxy service that may mask
                  your actual location.
                </li>
                <li>
                  For more information, please refer to our Terms of Service.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PolicyPage;
