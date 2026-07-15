import {
  ChevronDown,
  Mail,
  PackageCheck,
  RefreshCcw,
  Ruler,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  Link,
  Navigate,
  useParams,
} from "react-router-dom";

import AnnouncementBar from "../components/home/AnnouncementBar";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/home/Footer";

const INSTAGRAM_URL =
  "https://www.instagram.com/haya_the.merchandising/";

const pageContent = {
  contact: {
    eyebrow: "Customer Care",
    title: "Contact Us",
    intro:
      "Our team is here to help with product questions, sizing, delivery updates, order support, and general enquiries.",
    icon: Mail,
    sections: [
      {
        title: "Order Support",
        paragraphs: [
          "For help with an existing order, please keep your Haya order number ready. You can find it inside your account under My Orders.",
          "To help us resolve your query quickly, include the name used for the order, your registered email address, and a short description of the issue.",
        ],
      },
      {
        title: "Instagram",
        paragraphs: [
          "You can contact Haya through our official Instagram page for general enquiries, product questions, and collection updates.",
        ],
        action: {
          label: "Message Haya on Instagram",
          href: INSTAGRAM_URL,
        },
      },
      {
        title: "Response Time",
        paragraphs: [
          "We aim to respond as soon as possible. During launches, sales, holidays, and high-order periods, responses may take slightly longer.",
        ],
      },
    ],
  },

  delivery: {
    eyebrow: "Customer Care",
    title: "Delivery",
    intro:
      "Everything you need to know about processing times, shipping methods, charges, tracking, and delivery.",
    icon: Truck,
    sections: [
      {
        title: "Order Processing",
        paragraphs: [
          "Confirmed orders are prepared after payment verification or Cash on Delivery confirmation.",
          "Processing times may vary during launches, public holidays, sales, and periods of unusually high demand.",
        ],
      },
      {
        title: "Standard Delivery",
        paragraphs: [
          "Standard delivery normally takes approximately 5–7 business days after dispatch.",
          "Standard delivery is currently shown as free during checkout unless a different shipping charge is displayed before order confirmation.",
        ],
      },
      {
        title: "Express Delivery",
        paragraphs: [
          "Express delivery normally takes approximately 2–3 business days after dispatch.",
          "The current express delivery charge is displayed at checkout before you place the order.",
        ],
      },
      {
        title: "Cash on Delivery",
        paragraphs: [
          "Cash on Delivery is available for eligible orders within India.",
          "A ₹100 Cash on Delivery charge is added to eligible COD orders and is displayed separately during checkout.",
        ],
      },
      {
        title: "Delivery Delays",
        paragraphs: [
          "Courier delays, extreme weather, public holidays, regional restrictions, and incomplete addresses may affect delivery timelines.",
          "Please ensure your address, postal code, and phone number are complete and accurate before placing the order.",
        ],
      },
    ],
  },

  returns: {
    eyebrow: "Customer Care",
    title: "Returns & Exchanges",
    intro:
      "Please review the conditions below before requesting a return or exchange.",
    icon: RefreshCcw,
    sections: [
      {
        title: "Return Eligibility",
        paragraphs: [
          "Items should be unused, unworn, unwashed, unaltered, and returned with their original packaging and tags.",
          "Products showing signs of wear, fragrance, makeup, damage, washing, alteration, or improper handling may not be accepted.",
        ],
      },
      {
        title: "Report an Issue",
        paragraphs: [
          "If an item arrives damaged, defective, or different from what you ordered, contact us as soon as possible after delivery.",
          "Please provide your order number and clear photographs or videos showing the product and packaging.",
        ],
      },
      {
        title: "Non-Returnable Items",
        paragraphs: [
          "For hygiene and safety reasons, certain accessories, innerwear, opened products, personalised items, and clearance products may be non-returnable.",
          "The product page or promotional terms may include additional return restrictions.",
        ],
      },
      {
        title: "Refunds",
        paragraphs: [
          "Approved refunds are processed after the returned item has been received and inspected.",
          "Original shipping, express delivery, and Cash on Delivery charges may not be refundable unless the return is caused by an error from Haya.",
        ],
      },
      {
        title: "Return Shipping",
        paragraphs: [
          "Return shipping arrangements and charges depend on the reason for the return and the location of the customer.",
          "Please contact us before sending any item back. Unauthorised returns may not be accepted.",
        ],
      },
    ],
  },

  "size-guide": {
    eyebrow: "Customer Care",
    title: "Size Guide",
    intro:
      "Use this guide as a general reference. Product fit may vary depending on fabric, cut, construction, and styling.",
    icon: Ruler,
    sections: [
      {
        title: "How to Measure",
        paragraphs: [
          "Bust: measure around the fullest part of your bust while keeping the tape comfortably level.",
          "Waist: measure around the narrowest part of your natural waist.",
          "Hips: measure around the fullest part of your hips.",
          "Length: measure from the highest shoulder point down to your preferred garment length.",
        ],
      },
      {
        title: "General Clothing Guide",
        table: {
          headers: [
            "Size",
            "Bust",
            "Waist",
            "Hips",
          ],
          rows: [
            [
              "XS",
              "31–33 in",
              "24–26 in",
              "34–36 in",
            ],
            [
              "S",
              "33–35 in",
              "26–28 in",
              "36–38 in",
            ],
            [
              "M",
              "35–37 in",
              "28–30 in",
              "38–40 in",
            ],
            [
              "L",
              "37–40 in",
              "30–33 in",
              "40–43 in",
            ],
            [
              "XL",
              "40–43 in",
              "33–36 in",
              "43–46 in",
            ],
          ],
        },
      },
      {
        title: "Hijabs",
        paragraphs: [
          "Many Haya hijabs are offered in One Size. The exact dimensions, material, transparency, texture, and styling characteristics may differ between collections.",
          "Please check each product description for fabric-specific information.",
        ],
      },
      {
        title: "Between Sizes",
        paragraphs: [
          "For a relaxed fit, choose the larger size. For a closer fit, choose the smaller size where the design allows.",
          "When in doubt, review the individual product details or contact us before ordering.",
        ],
      },
    ],
  },

  faqs: {
    eyebrow: "Customer Care",
    title: "Frequently Asked Questions",
    intro:
      "Quick answers about ordering, payment, delivery, sizing, stock, and account access.",
    icon: PackageCheck,
    faqs: [
      {
        question:
          "Do I need an account to place an order?",
        answer:
          "Customers must be signed in before completing checkout. This allows Haya to securely connect the order to your account and provide order history.",
      },
      {
        question:
          "Which payment methods are available?",
        answer:
          "Customers can pay online through Razorpay using the available payment methods shown in the secure checkout window. Eligible customers in India may also select Cash on Delivery.",
      },
      {
        question:
          "Is there a Cash on Delivery charge?",
        answer:
          "Yes. A ₹100 Cash on Delivery charge applies to eligible COD orders and is displayed separately before the order is placed.",
      },
      {
        question:
          "When is stock reserved?",
        answer:
          "For online payments, stock is updated only after payment verification and order confirmation. For Cash on Delivery orders, stock is updated when the COD order is securely confirmed.",
      },
      {
        question:
          "Can I cancel my order?",
        answer:
          "Contact Haya as soon as possible. Cancellation may not be possible once an order has entered processing, packing, or shipping.",
      },
      {
        question:
          "How can I track my order?",
        answer:
          "Order status is available inside your Haya account. Additional tracking details may be provided after dispatch where available.",
      },
      {
        question:
          "What should I do if I entered the wrong address?",
        answer:
          "Contact Haya immediately with your order number and corrected details. Address changes cannot be guaranteed after processing has begun.",
      },
      {
        question:
          "Why does a product look slightly different in person?",
        answer:
          "Colours may vary slightly because of lighting, photography, editing, screen calibration, fabric texture, and dye variation.",
      },
      {
        question:
          "Will sold-out products return?",
        answer:
          "Selected styles and colours may be restocked, but availability is not guaranteed. Follow Haya on Instagram for restock and launch updates.",
      },
    ],
  },

  about: {
    eyebrow: "About Haya",
    title: "Our Story",
    intro:
      "Haya is built around modern modest dressing—thoughtful pieces that feel refined, comfortable, expressive, and easy to wear.",
    icon: Sparkles,
    sections: [
      {
        title: "Modern Modesty",
        paragraphs: [
          "Our approach brings together modest silhouettes, wearable fabrics, considered colour stories, and details designed for everyday elegance.",
          "We believe modest fashion can feel contemporary without losing comfort, versatility, or individuality.",
        ],
      },
      {
        title: "Thoughtful Collections",
        paragraphs: [
          "Each Haya collection is selected with attention to drape, texture, movement, styling possibilities, and how a piece fits into a modern wardrobe.",
          "From everyday hijabs to elevated modestwear, our goal is to offer pieces that can be styled repeatedly and confidently.",
        ],
      },
      {
        title: "Designed Around You",
        paragraphs: [
          "Haya is continually shaped by customer feedback, changing needs, new fabrics, and the way modest fashion is worn in real life.",
          "We are committed to improving the shopping experience, product information, delivery process, and collection quality over time.",
        ],
      },
    ],
  },

  journal: {
    eyebrow: "Haya Journal",
    title: "Stories & Styling",
    intro:
      "A space for modest styling ideas, fabric guidance, collection notes, and thoughtful wardrobe inspiration.",
    icon: Sparkles,
    sections: [
      {
        title: "How to Choose a Hijab Fabric",
        paragraphs: [
          "The right fabric depends on the look, climate, occasion, coverage, and styling method you prefer.",
          "Chiffon offers an elegant drape, jersey provides comfort and grip, satin creates a polished finish, and organza adds structure and occasion-ready texture.",
        ],
      },
      {
        title: "Building a Modest Wardrobe",
        paragraphs: [
          "Start with versatile neutral pieces, comfortable everyday fabrics, and silhouettes that layer well.",
          "Add colour, texture, prints, and statement accessories gradually to create more styling possibilities without overcomplicating your wardrobe.",
        ],
      },
      {
        title: "Care for Delicate Fabrics",
        paragraphs: [
          "Always check the individual product instructions before washing.",
          "Delicate fabrics generally benefit from gentle handling, mild detergent, cool water, careful drying, and low-temperature steaming where appropriate.",
        ],
      },
    ],
  },

  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro:
      "This policy explains the types of information Haya may collect and how it may be used while operating the website and fulfilling orders.",
    icon: ShieldCheck,
    sections: [
      {
        title: "Information We Collect",
        paragraphs: [
          "We may collect information you provide while creating an account, placing an order, contacting support, or using the website.",
          "This may include your name, email address, phone number, shipping address, order information, account identifiers, and customer-support communications.",
        ],
      },
      {
        title: "Payment Information",
        paragraphs: [
          "Online payments are processed through Razorpay. Haya does not directly collect or store your complete card, UPI, net-banking, or wallet credentials.",
          "We may store payment references, payment status, transaction identifiers, and related order information needed for verification, support, accounting, fraud prevention, and fulfilment.",
        ],
      },
      {
        title: "How Information Is Used",
        paragraphs: [
          "Information may be used to manage accounts, process orders, verify payments, provide delivery, prevent misuse, maintain security, respond to enquiries, and improve the website.",
        ],
      },
      {
        title: "Service Providers",
        paragraphs: [
          "Relevant information may be shared with service providers involved in payment processing, hosting, database services, delivery, communications, security, analytics, and customer support.",
          "Only information reasonably needed to provide the relevant service should be shared.",
        ],
      },
      {
        title: "Data Retention",
        paragraphs: [
          "Order, payment, account, and support records may be retained for operational, legal, accounting, fraud-prevention, and dispute-resolution purposes.",
        ],
      },
      {
        title: "Your Choices",
        paragraphs: [
          "You may contact Haya regarding access, correction, or deletion requests relating to your information, subject to legal, fraud-prevention, accounting, and operational requirements.",
        ],
      },
      {
        title: "Policy Updates",
        paragraphs: [
          "This policy may be updated when the website, business processes, technology, or legal requirements change.",
        ],
      },
    ],
  },

  terms: {
    eyebrow: "Legal",
    title: "Terms & Conditions",
    intro:
      "These terms apply when you access the Haya website, create an account, place an order, or use our services.",
    icon: ShieldCheck,
    sections: [
      {
        title: "Website Use",
        paragraphs: [
          "You agree to use the website lawfully and not interfere with its security, availability, functionality, accounts, payments, or data.",
        ],
      },
      {
        title: "Product Information",
        paragraphs: [
          "We aim to provide accurate descriptions, images, pricing, sizing, colour information, and availability.",
          "Minor differences may occur because of lighting, screen settings, fabric variation, manufacturing tolerances, and photography.",
        ],
      },
      {
        title: "Orders",
        paragraphs: [
          "Submitting checkout does not guarantee acceptance until the order is successfully confirmed.",
          "Haya may cancel or review an order because of stock errors, pricing errors, payment issues, suspected misuse, delivery limitations, or incorrect customer information.",
        ],
      },
      {
        title: "Payments",
        paragraphs: [
          "Online payments must be successfully verified before an online-payment order is confirmed.",
          "Eligible Cash on Delivery orders remain payment-pending until the amount is collected.",
        ],
      },
      {
        title: "Pricing",
        paragraphs: [
          "The final amount shown before confirmation may include the product subtotal, delivery charges, Cash on Delivery charges, discounts, and applicable taxes.",
        ],
      },
      {
        title: "Cancellations and Returns",
        paragraphs: [
          "Cancellation, return, exchange, and refund requests are subject to the conditions shown on the website and the status and condition of the order.",
        ],
      },
      {
        title: "Intellectual Property",
        paragraphs: [
          "Website content, branding, product photography, graphics, design, text, and other materials may not be copied, reproduced, or commercially used without permission.",
        ],
      },
      {
        title: "Changes",
        paragraphs: [
          "Haya may update these terms, website features, prices, products, policies, and services when required.",
        ],
      },
    ],
  },

  cookies: {
    eyebrow: "Legal",
    title: "Cookie Policy",
    intro:
      "This page explains how browser storage and similar technologies may support the operation of the Haya website.",
    icon: ShieldCheck,
    sections: [
      {
        title: "Essential Storage",
        paragraphs: [
          "The website may use cookies, local storage, or similar browser technologies to keep you signed in, maintain security, remember your bag, preserve preferences, and support checkout.",
        ],
      },
      {
        title: "Authentication",
        paragraphs: [
          "Authentication information may be stored securely to maintain your signed-in session and protect access to account and order information.",
        ],
      },
      {
        title: "Shopping Bag and Preferences",
        paragraphs: [
          "Local browser storage may be used to remember bag contents, selected product variants, wishlist items, and website preferences.",
        ],
      },
      {
        title: "Third-Party Services",
        paragraphs: [
          "Payment, hosting, database, analytics, security, or other service providers may use their own technical storage where required to provide their services.",
        ],
      },
      {
        title: "Managing Storage",
        paragraphs: [
          "You can manage cookies and website storage through your browser settings.",
          "Blocking essential storage may prevent account login, bag persistence, checkout, and other website functions from working correctly.",
        ],
      },
    ],
  },
};

function InformationSection({
  section,
}) {
  return (
    <section className="border-t border-black/10 py-8 sm:py-10">
      <h2 className="font-serif text-[25px] tracking-[-0.025em] sm:text-[30px]">
        {section.title}
      </h2>

      {section.paragraphs && (
        <div className="mt-5 space-y-4">
          {section.paragraphs.map(
            (paragraph) => (
              <p
                key={paragraph}
                className="max-w-[820px] text-[11px] leading-7 text-[#6f655e] sm:text-[12px]"
              >
                {paragraph}
              </p>
            )
          )}
        </div>
      )}

      {section.table && (
        <div className="mt-6 overflow-x-auto border border-black/10">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead className="bg-[#e7dfd7]">
              <tr>
                {section.table.headers.map(
                  (header) => (
                    <th
                      key={header}
                      className="border-b border-black/10 px-5 py-4 text-[8px] uppercase tracking-[0.17em]"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {section.table.rows.map(
                (row) => (
                  <tr
                    key={row.join("-")}
                    className="border-b border-black/[0.07] last:border-0"
                  >
                    {row.map(
                      (value) => (
                        <td
                          key={value}
                          className="px-5 py-4 text-[10px] text-[#625950]"
                        >
                          {value}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {section.action && (
        <a
  href={section.action.href}
  target="_blank"
  rel="noreferrer"
  className="mt-6 inline-flex min-h-12 items-center justify-center bg-[#211c18] px-7 text-[8px] uppercase tracking-[0.2em] text-white transition hover:bg-black"
>
  {section.action.label}
</a>
      )}
    </section>
  );
}

function FaqItem({
  item,
  isOpen,
  onToggle,
}) {
  return (
    <div className="border-b border-black/10">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-5 py-6 text-left"
      >
        <span className="text-[10px] uppercase leading-6 tracking-[0.13em] sm:text-[11px]">
          {item.question}
        </span>

        <ChevronDown
          size={17}
          strokeWidth={1.3}
          className={`mt-1 shrink-0 transition-transform ${
            isOpen
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {isOpen && (
        <p className="max-w-[820px] pb-6 text-[11px] leading-7 text-[#6f655e] sm:text-[12px]">
          {item.answer}
        </p>
      )}
    </div>
  );
}

export default function StaticPage({
  pageKey: providedPageKey,
}) {
  const params = useParams();

  const pageKey =
    providedPageKey ||
    params.pageKey;

  const page =
    pageContent[pageKey];

  const [
    openFaqIndex,
    setOpenFaqIndex,
  ] = useState(0);

  if (!page) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  const PageIcon =
    page.icon ||
    Sparkles;

  return (
    <main className="min-h-screen bg-[#f5f1ec] text-[#211c18]">
      <AnnouncementBar />
      <Navbar />

      <section className="mx-auto max-w-[1200px] px-4 pb-20 pt-[140px] sm:px-7 sm:pt-[155px] lg:px-12 lg:pb-28 lg:pt-[175px]">
        <div className="border-b border-black/10 pb-10 sm:pb-12">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15">
            <PageIcon
              size={19}
              strokeWidth={1.3}
            />
          </div>

          <p className="mt-7 text-[8px] uppercase tracking-[0.28em] text-[#7d726a]">
            {page.eyebrow}
          </p>

          <h1 className="mt-4 max-w-[850px] font-serif text-[42px] leading-[0.95] tracking-[-0.045em] sm:text-[58px] lg:text-[68px]">
            {page.title}
          </h1>

          <p className="mt-6 max-w-[760px] text-[11px] leading-7 text-[#71665e] sm:text-[13px] sm:leading-8">
            {page.intro}
          </p>
        </div>

        {page.sections && (
          <div>
            {page.sections.map(
              (section) => (
                <InformationSection
                  key={section.title}
                  section={section}
                />
              )
            )}
          </div>
        )}

        {page.faqs && (
          <div className="border-t border-black/10">
            {page.faqs.map(
              (item, index) => (
                <FaqItem
                  key={item.question}
                  item={item}
                  isOpen={
                    openFaqIndex ===
                    index
                  }
                  onToggle={() =>
                    setOpenFaqIndex(
                      openFaqIndex ===
                        index
                        ? null
                        : index
                    )
                  }
                />
              )
            )}
          </div>
        )}

        <div className="mt-12 border border-black/10 bg-[#eee7df] p-6 sm:p-8">
          <p className="text-[8px] uppercase tracking-[0.2em] text-[#756b63]">
            Need More Help?
          </p>

          <h2 className="mt-3 font-serif text-[28px] tracking-[-0.03em] sm:text-[34px]">
            We’re here to help.
          </h2>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex min-h-12 items-center justify-center bg-[#211c18] px-7 text-[8px] uppercase tracking-[0.2em] text-white transition hover:bg-black"
            >
              Contact Haya
            </Link>

            <a
  href={INSTAGRAM_URL}
  target="_blank"
  rel="noreferrer"
  className="inline-flex min-h-12 items-center justify-center border border-black/15 px-7 text-[8px] uppercase tracking-[0.2em] transition hover:border-black/40"
>
  Instagram
</a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}