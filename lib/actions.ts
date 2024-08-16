'use server';

import { getDB } from '@/lib/db';
import { Word, Definition, Example, Mention } from '@/lib/types';
import { z } from 'zod';

export type State = {
  message: {
    text: string;
    type: 'success' | 'warning' | 'error';
  };
  errors?: {
    word_text?: string[];
    def_content?: string[];
    def_reference?: string[];
  };
};

const formSchema = z.object({
  word_text: z.string().min(2).max(50),
  def_content: z.string().min(10).max(255),
  def_reference: z.string().min(10).max(45),
  example_text: z.string().min(10).max(145),
  example_reference: z.string().max(45),
  mention_title: z.string().min(10).max(45),
  mention_hyperlink: z.string().startsWith('https://', { message: 'Must provide secure URL' }),
  report_element: z.string()
});

const addDefinitionSchema = formSchema.pick({
  word_text: true,
  def_content: true,
  def_reference: true,
});
const addExampleSchema = formSchema.pick({
  word_text: true,
  example_text: true,
  example_reference: true,
});
const addMentionSchema = formSchema.pick({
  word_text: true,
  mention_title: true,
  mention_hyperlink: true,
});
const reportSchema = formSchema.pick({
  word_text: true,
  report_element: true,
})

export async function addWord(_: State, formData: FormData): Promise<State> {
  const valFields = addDefinitionSchema.safeParse({
    word_text: formData.get('word_text'),
    def_content: formData.get('def_content'),
    def_reference: formData.get('def_reference'),
  });

  if (!valFields.success) {
    return {
      message: { text: 'Error submitting the form!', type: 'error' },
      errors: valFields.error.flatten().fieldErrors,
    };
  }

  const { word_text, def_content, def_reference } = valFields.data;
  const newWord = {
    text: word_text.toLowerCase(),
    definitions: [
      {
        text: def_content,
        reference: def_reference,
        V: 1,
        NV: 0,
      },
    ],
    examples: [{ text: '', reference: '', V: 1, NV: 0 }],
    mentions: [{ title: '', hyperlink: '', V: 1, NV: 0 }],
    V: 1,
    NV: 0,
  };

  try {
    const sf = (await getDB()).get(newWord.text.slice(0, 2));
    const exists = sf.getWhere((word) => (word as Word).text == newWord.text);
    if ((exists as Word).text) {
      return {
        message: { text: newWord.text + ' already exists.', type: 'warning' },
        errors: {
          word_text: ['word already exists'],
        },
      };
    }
    sf.add(newWord);
    return {
      message: { text: newWord.text + ' has been successfully added.', type: 'success' },
    };
  } catch (err) {
    console.error(Date().split(' ')[4], ': ', err);
    return {
      message: { text: 'Something went wrong!', type: 'error' },
    };
  }
}

export async function addDefinition(_: State, formData: FormData) {
  const valFields = addDefinitionSchema.safeParse({
    word_text: formData.get('word_text'),
    def_content: formData.get('def_content'),
    def_reference: formData.get('def_reference'),
  });

  if (!valFields.success) {
    return {
      message: { text: 'Error submitting the form!', type: 'error' },
      errors: valFields.error.flatten().fieldErrors,
    };
  }

  const newDefinition: Definition = {
    text: valFields.data.def_content,
    reference: valFields.data.def_reference,
    V: 1,
    NV: 0,
  };

  try {
    const sf = (await getDB()).get(valFields.data.word_text.slice(0, 2));
    // check if a def from the same ref exists
    const exists = sf.getWhere((word) =>
      word.definitions.find((def) => def.reference == newDefinition.reference),
    );
    if (exists.text) {
      return {
        message: {
          text: 'Failed: there is already a definition from the same reference included!',
          type: 'error',
        },
      };
    }
    sf.updateWhere(
      (word) => (word as Word).text == valFields.data.word_text,
      (prev) => ({
        definitions: [...prev.definitions, newDefinition],
      }),
    );
    return {
      message: {
        text: 'Your definition has been added successfully. Refresh the page and check it out.',
        type: 'success',
      },
    };
  } catch (err) {
    console.error(Date().split(' ')[4], ': ', err);
    return {
      message: { text: 'Something went wrong!', type: 'error' },
    };
  }
}

export async function addExample(_: State, formData: FormData) {
  const valFields = addExampleSchema.safeParse({
    word_text: formData.get('word_text'),
    example_text: formData.get('example_text'),
    example_reference: formData.get('example_reference'),
  });

  if (!valFields.success) {
    return {
      message: { text: 'Error submitting the form!', type: 'error' },
      errors: valFields.error.flatten().fieldErrors,
    };
  }

  const newExample: Example = {
    text: valFields.data.example_text,
    reference: valFields.data.example_reference,
    V: 1,
    NV: 0,
  };

  try {
    const sf = (await getDB()).get(valFields.data.word_text.slice(0, 2));
    // check if a def from the same ref exists
    sf.updateWhere(
      (word) => (word as Word).text == valFields.data.word_text,
      (prev) => ({
        examples: [...prev.examples, newExample],
      }),
    );
    return {
      message: {
        text: 'The example has been added successfully. Refresh the page and check it out.',
        type: 'success',
      },
    };
  } catch (err) {
    console.error(Date().split(' ')[4], ': ', err);
    return {
      message: { text: 'Something went wrong!', type: 'error' },
    };
  }
}

export async function addMention(_: State, formData: FormData) {
  const valFields = addMentionSchema.safeParse({
    word_text: formData.get('word_text'),
    mention_title: formData.get('mention_title'),
    mention_hyperlink: formData.get('mention_hyperlink'),
  });

  if (!valFields.success) {
    return {
      message: { text: 'Error submitting the form!', type: 'error' },
      errors: valFields.error.flatten().fieldErrors,
    };
  }

  const newMention: Mention = {
    title: valFields.data.mention_title,
    hyperlink: valFields.data.mention_hyperlink,
    V: 1,
    NV: 0,
  };

  try {
    const sf = (await getDB()).get(valFields.data.word_text.slice(0, 2));
    // check if a def from the same ref exists
    sf.updateWhere(
      (word) => (word as Word).text == valFields.data.word_text,
      (prev) => ({
        mentions: [...prev.mentions, newMention],
      }),
    );
    return {
      message: {
        text: 'The data has been added successfully. Refresh the page and check it out.',
        type: 'success',
      },
    };
  } catch (err) {
    console.error(Date().split(' ')[4], ': ', err);
    return {
      message: { text: 'Something went wrong!', type: 'error' },
    };
  }
}


import { auth } from '@/auth'

export async function Report(_: State, formData: FormData) {
  const valFields = reportSchema.safeParse({
    word_text: formData.get('word_text'),
    report_element: formData.get('report_element'),
  })

  const session = await auth()
  if (!session?.user) {
    return {
      message: { text: 'You have to login in order to report items.', type: 'error' },
    };
  }

  if (!valFields.success) {
    return {
      message: { text: 'Error submitting the form!', type: 'error' },
      errors: valFields.error.flatten().fieldErrors,
    };
  }

  try {
    const sf = (await getDB()).get(valFields.data.word_text.slice(0, 2));
    const index = sf.getIndexOf((word) => (word as Word).text == valFields.data.word_text)[0];
    let word = sf.get(index)
    if (!(word as Word).text) {
      return {message: { text: 'Cannot find the word ' + word.text, type: 'error' }};
    }
    const { report_element } = valFields.data;
    if (!["word", "definition", "example", "mention"].includes(report_element)) {
      return {message: { text: 'Invalid input!', type: 'error' }};
    }
    word = reportElement(word, report_element);
    sf.update(index, () => word)
    return {
      message: {
        text: 'Done. Thanks for reporting.',
        type: 'success',
      },
    };
  } catch (err) {
    console.error(Date().split(' ')[4], ': ', err);
    return {
      message: { text: 'Something went wrong!', type: 'error' },
    };
  }
}

type Element = {
  type: "word" | "definition" | "example" | "mention",
  id: string // it could be definition reference, example text, or mention hyperlink.
}

// map from element type to its id attribute
const identifiers = {
  word: "word_text",
  definition: "def_reference",
  example: "example_text",
  mention: "mention_hyperlink"
}

function reportElement(word: Word, element_type: string): Word {
  if (element_type === "word") {
    word.NV += 2
    return word
  }
  else if (element_type === "definition") {
    const i = word.definitions.findIndex(def => def[identifiers[element_type]] === element_id)
    word.definitions[i].NV += 2
    return word
  }
  else if (element.type == "example") {
    const i = word.examples.findIndex(exam => exam[identifiers[element_type]] === element_id)
    word.examples[i].NV += 2
    return word
  }
  else if (element.type == "mention") {
    const i = word.mentions.findIndex(mention => mention[identifiers[element_type]] === element_id)
    word.mentions[i].NV += 2
    return word
  }
  else {
    throw Error("reportElement Error: invalid usage!")
  }
} 
