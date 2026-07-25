export interface FAQItem {
  question: string;
  answer: string;
  colors: {
    light: string;
    dark: string;
  };
}

export const FAQS: FAQItem[] = [
  {
    question: "What is Reflections | Projections (R|P)?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo at sapien tristique commodo. Praesent non erat sed lorem tincidunt consequat.",
    colors: { light: "#8D0000", dark: "#600000" }
  },
  {
    question: "When and where is R|P?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere, nibh vitae faucibus fermentum, lorem nisl ultricies mauris, ut feugiat erat velit a nibh.",
    colors: { light: "#322BB7", dark: "#221D88" }
  },
  {
    question: "Who can attend R|P?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec malesuada tortor id sem volutpat, vitae facilisis sapien ultrices.",
    colors: { light: "#56BF59", dark: "#429945" }
  },
  {
    question: "What do I need to do before R|P?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ullamcorper, metus quis pulvinar pellentesque, augue risus tempor justo, sit amet mattis nulla elit sed arcu.",
    colors: { light: "#E6930D", dark: "#B77408" }
  },
  {
    question: "What is the Point System?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod, lectus vel hendrerit luctus, mi neque tristique dui, sed consequat sapien urna sit amet libero.",
    colors: { light: "#47438A", dark: "#312F63" }
  }
];
