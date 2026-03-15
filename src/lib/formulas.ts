import { Subject } from '../types';

export interface Formula {
  chapter: string;
  formulas: {
    name: string;
    math: string;
  }[];
}

export const getFormulasForSubject = (subject: Subject): Formula[] => {
  switch (subject) {
    case 'Higher Math 1st Paper':
      return [
        {
          chapter: 'ম্যাট্রিক্স ও নির্ণায়ক (Matrix & Determinant)',
          formulas: [
            { name: 'বিপরীত ম্যাট্রিক্স (Inverse Matrix)', math: 'A^{-1} = \\frac{1}{|A|} \\text{adj}(A)' }
          ]
        },
        {
          chapter: 'সরলরেখা (Straight Line)',
          formulas: [
            { name: 'দুটি বিন্দুগামী সরলরেখার সমীকরণ', math: '\\frac{y - y_1}{y_1 - y_2} = \\frac{x - x_1}{x_1 - x_2}' },
            { name: 'ঢাল-ছেদক আকার', math: 'y = mx + c' },
            { name: 'লম্ব দূরত্ব', math: 'd = \\frac{|ax_1 + by_1 + c|}{\\sqrt{a^2 + b^2}}' }
          ]
        },
        {
          chapter: 'বৃত্ত (Circle)',
          formulas: [
            { name: 'সাধারণ সমীকরণ', math: 'x^2 + y^2 + 2gx + 2fy + c = 0' },
            { name: 'কেন্দ্র ও ব্যাসার্ধ', math: '\\text{Center: } (-g, -f), \\text{ Radius: } \\sqrt{g^2 + f^2 - c}' }
          ]
        },
        {
          chapter: 'ত্রিকোণমিতি (Trigonometry)',
          formulas: [
            { name: 'যৌগিক কোণ', math: '\\sin(A \\pm B) = \\sin A \\cos B \\pm \\cos A \\sin B' },
            { name: 'গুণিতক কোণ', math: '\\cos 2A = \\cos^2 A - \\sin^2 A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A' }
          ]
        },
        {
          chapter: 'অন্তরীকরণ (Differentiation)',
          formulas: [
            { name: 'ঘাতের সূত্র', math: '\\frac{d}{dx}(x^n) = nx^{n-1}' },
            { name: 'গুণফলের সূত্র', math: '\\frac{d}{dx}(uv) = u\\frac{dv}{dx} + v\\frac{du}{dx}' }
          ]
        },
        {
          chapter: 'যোগজীকরণ (Integration)',
          formulas: [
            { name: 'ঘাতের সূত্র', math: '\\int x^n dx = \\frac{x^{n+1}}{n+1} + c \\quad (n \\neq -1)' },
            { name: 'আংশিক যোগজীকরণ', math: '\\int u dv = uv - \\int v du' }
          ]
        }
      ];
    case 'Higher Math 2nd Paper':
      return [
        {
          chapter: 'জটিল সংখ্যা (Complex Numbers)',
          formulas: [
            { name: 'মডুলাস ও আর্গুমেন্ট', math: '|z| = \\sqrt{x^2 + y^2}, \\quad \\theta = \\tan^{-1}\\left(\\frac{y}{x}\\right)' }
          ]
        },
        {
          chapter: 'বহুপদী ও বহুপদী সমীকরণ (Polynomials)',
          formulas: [
            { name: 'মূলদ্বয়ের যোগফল ও গুণফল', math: '\\alpha + \\beta = -\\frac{b}{a}, \\quad \\alpha\\beta = \\frac{c}{a}' }
          ]
        },
        {
          chapter: 'কণিক (Conics)',
          formulas: [
            { name: 'পরাবৃত্তের সমীকরণ', math: 'y^2 = 4ax \\quad \\text{or} \\quad x^2 = 4ay' },
            { name: 'উপবৃত্তের সমীকরণ', math: '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1' }
          ]
        },
        {
          chapter: 'বিপরীত ত্রিকোণমিতিক ফাংশন',
          formulas: [
            { name: 'যোগফল', math: '\\tan^{-1}x + \\tan^{-1}y = \\tan^{-1}\\left(\\frac{x+y}{1-xy}\\right)' }
          ]
        },
        {
          chapter: 'স্থিতিবিদ্যা (Statics)',
          formulas: [
            { name: 'লব্ধির মান', math: 'R = \\sqrt{P^2 + Q^2 + 2PQ\\cos\\alpha}' }
          ]
        },
        {
          chapter: 'গতিবিদ্যা (Dynamics)',
          formulas: [
            { name: 'গতির সমীকরণ', math: 'v = u + at, \\quad s = ut + \\frac{1}{2}at^2, \\quad v^2 = u^2 + 2as' },
            { name: 'প্রাসের পাল্লা', math: 'R = \\frac{u^2 \\sin 2\\alpha}{g}' }
          ]
        }
      ];
    case 'Physics 1st Paper':
      return [
        {
          chapter: 'ভেক্টর (Vector)',
          formulas: [
            { name: 'ডট গুণন', math: '\\vec{A} \\cdot \\vec{B} = AB \\cos\\theta' },
            { name: 'ক্রস গুণন', math: '|\\vec{A} \\times \\vec{B}| = AB \\sin\\theta' }
          ]
        },
        {
          chapter: 'নিউটনিয়ান বলবিদ্যা (Newtonian Mechanics)',
          formulas: [
            { name: 'বলের সমীকরণ', math: 'F = ma = \\frac{dp}{dt}' },
            { name: 'কৌণিক ভরবেগ', math: 'L = I\\omega = r \\times p' }
          ]
        },
        {
          chapter: 'কাজ, শক্তি ও ক্ষমতা (Work, Energy & Power)',
          formulas: [
            { name: 'গতিশক্তি', math: 'E_k = \\frac{1}{2}mv^2 = \\frac{p^2}{2m}' },
            { name: 'ক্ষমতা', math: 'P = \\frac{W}{t} = \\vec{F} \\cdot \\vec{v}' }
          ]
        },
        {
          chapter: 'মহাকর্ষ ও অভিকর্ষ (Gravitation)',
          formulas: [
            { name: 'মহাকর্ষ বল', math: 'F = G \\frac{m_1 m_2}{r^2}' },
            { name: 'মুক্তিবেগ', math: 'v_e = \\sqrt{\\frac{2GM}{R}} = \\sqrt{2gR}' }
          ]
        },
        {
          chapter: 'পর্যাবৃত্ত গতি (Periodic Motion)',
          formulas: [
            { name: 'সরল দোলকের দোলনকাল', math: 'T = 2\\pi \\sqrt{\\frac{L}{g}}' },
            { name: 'স্প্রিং এর দোলনকাল', math: 'T = 2\\pi \\sqrt{\\frac{m}{k}}' }
          ]
        },
        {
          chapter: 'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব',
          formulas: [
            { name: 'আদর্শ গ্যাস সমীকরণ', math: 'PV = nRT' },
            { name: 'গড় বর্গবেগ (RMS)', math: 'C_{rms} = \\sqrt{\\frac{3RT}{M}}' }
          ]
        }
      ];
    case 'Physics 2nd Paper':
      return [
        {
          chapter: 'তাপগতিবিদ্যা (Thermodynamics)',
          formulas: [
            { name: 'প্রথম সূত্র', math: 'dQ = dU + dW' },
            { name: 'কার্নো ইঞ্জিনের দক্ষতা', math: '\\eta = 1 - \\frac{T_2}{T_1}' }
          ]
        },
        {
          chapter: 'স্থির তড়িৎ (Static Electricity)',
          formulas: [
            { name: 'কুলম্বের সূত্র', math: 'F = \\frac{1}{4\\pi\\epsilon_0} \\frac{q_1 q_2}{r^2}' },
            { name: 'ধারকত্ব', math: 'C = \\frac{Q}{V}, \\quad C = \\frac{\\epsilon_0 A}{d}' }
          ]
        },
        {
          chapter: 'চল তড়িৎ (Current Electricity)',
          formulas: [
            { name: 'ওহমের সূত্র', math: 'V = IR' },
            { name: 'তড়িৎ ক্ষমতা', math: 'P = VI = I^2R = \\frac{V^2}{R}' }
          ]
        },
        {
          chapter: 'ভৌত আলোকবিজ্ঞান (Physical Optics)',
          formulas: [
            { name: 'ইয়ং এর দ্বি-চিড় পরীক্ষা', math: '\\Delta y = \\frac{\\lambda D}{d}' }
          ]
        },
        {
          chapter: 'আধুনিক পদার্থবিজ্ঞানের সূচনা',
          formulas: [
            { name: 'আইনস্টাইনের ভর-শক্তি সমীকরণ', math: 'E = mc^2' },
            { name: 'ফোটনের শক্তি', math: 'E = h\\nu = \\frac{hc}{\\lambda}' }
          ]
        }
      ];
    case 'Chemistry 1st Paper':
      return [
        {
          chapter: 'গুণগত রসায়ন (Qualitative Chemistry)',
          formulas: [
            { name: 'রিডবার্গ সমীকরণ', math: '\\frac{1}{\\lambda} = R_H \\left( \\frac{1}{n_1^2} - \\frac{1}{n_2^2} \\right)' },
            { name: 'বোর ব্যাসার্ধ', math: 'r_n = \\frac{n^2 h^2}{4\\pi^2 m e^2 Z}' }
          ]
        },
        {
          chapter: 'রাসায়নিক পরিবর্তন (Chemical Changes)',
          formulas: [
            { name: 'ভরক্রিয়া সূত্র', math: 'K_c = \\frac{[C]^c [D]^d}{[A]^a [B]^b}' },
            { name: 'pH সমীকরণ', math: '\\text{pH} = -\\log[H^+]' },
            { name: 'হেন্ডারসন-হ্যাসেলবাখ সমীকরণ', math: '\\text{pH} = pK_a + \\log\\frac{[\\text{Salt}]}{[\\text{Acid}]}' }
          ]
        }
      ];
    case 'Chemistry 2nd Paper':
      return [
        {
          chapter: 'পরিবেশ রসায়ন (Environmental Chemistry)',
          formulas: [
            { name: 'বয়েল ও চার্লসের সূত্র', math: 'P_1 V_1 = P_2 V_2, \\quad \\frac{V_1}{T_1} = \\frac{V_2}{T_2}' },
            { name: 'গ্রাহামের ব্যাপন সূত্র', math: '\\frac{r_1}{r_2} = \\sqrt{\\frac{M_2}{M_1}} = \\sqrt{\\frac{d_2}{d_1}}' }
          ]
        },
        {
          chapter: 'তড়িৎ রসায়ন (Electrochemistry)',
          formulas: [
            { name: 'ফ্যারাডের সূত্র', math: 'W = ZIt' },
            { name: 'নার্নস্ট সমীকরণ', math: 'E = E^0 - \\frac{RT}{nF} \\ln Q' }
          ]
        },
        {
          chapter: 'পরিমাণগত রসায়ন (Quantitative Chemistry)',
          formulas: [
            { name: 'মোলারিটি', math: 'S = \\frac{W \\times 1000}{M \\times V}' },
            { name: 'টাইট্রেশন সমীকরণ', math: 'V_1 S_1 = V_2 S_2' }
          ]
        }
      ];
    default:
      return [];
  }
};

export const hasFormulas = (subject: Subject): boolean => {
  return ['Higher Math 1st Paper', 'Higher Math 2nd Paper', 'Physics 1st Paper', 'Physics 2nd Paper', 'Chemistry 1st Paper', 'Chemistry 2nd Paper'].includes(subject);
};
