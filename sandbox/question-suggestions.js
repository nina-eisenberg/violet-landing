import {caseAnswers,responseAvailable} from './case-answers.js';

// Suggestions never imply that a record has been uploaded before it has.
export function suggestQuestions(state, title = '', answered = []) {
  const eligible = caseAnswers.filter(answer =>
    !answered.includes(answer.id) && responseAvailable(answer,state) && answer.title !== title &&
    answer.requires.every(id => state.files.includes(id)) &&
    (!answer.needsFindings || state.findings.every(Boolean)));
  const priorities = /report|complete/i.test(title)
    ? ['executive', 'retaliation', 'harassment']
    : /plan/i.test(title)
      ? ['reword5', 'priya', 'client']
      : /Marcus|Doyle|outline/i.test(title)
        ? ['credibility', 'followup', 'knowledge', 'email']
        : /Leah|Goldberg/i.test(title)
          ? ['consistency', 'huddle', 'client']
          : /Jordan|Kim/i.test(title)
            ? ['hearers', 'huddle', 'harassment']
            : /Carla|Rivera/i.test(title)
              ? ['list', 'contradictions', 'hearers']
              : /findings|alignment|matrix|next|timeline/i.test(title)
                ? ['gaps', 'retaliation', 'contradictions', 'deadline']
                : ['deadline', 'consistency', 'pay', 'client'];
  const ids = [...new Set([...priorities, 'knowledge', 'huddle', 'credibility', 'client'])];
  return ids.map(id => eligible.find(answer => answer.id === id))
    .filter(Boolean).slice(0, 3);
}
