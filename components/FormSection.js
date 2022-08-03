import React, { useState } from "react";

const FormSection = ({
  title = "Section Name",
  questions = ["How is the team?", "How is the route to market?"],
  openStatus = false,
  questionUpdated,
}) => {
  return (
    <details
      className="bg-gray-300 open:bg-blue-100 duration-300"
      open={openStatus}
    >
      <summary className="select-none bg-inherit px-5 py-3 text-lg cursor-pointer">
        {title}
      </summary>
      <div className="bg-white px-5 py-3 border border-gray-300 text-sm font-light">
        {questions &&
          questions.map((question, i) => {
            return (
              <div key={i}>
                <Question
                  QUESTION={question}
                  questionUpdated={questionUpdated}
                />
              </div>
            );
          })}
      </div>
    </details>
  );
};

const Question = ({ QUESTION, questionUpdated }) => {
  const [question, setQuestion] = useState(QUESTION);

  const handleQuestionChange = (e) => {
    questionUpdated({ question: question.question, answer: e.target.value });
    setQuestion({
      question: question.question,
      answer: e.target.value,
    });
  };

  return (
    <form className="py-4">
      <div className="flex justify-between">
        <label
          htmlFor="steps-range"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          {question.question}
        </label>
        <div
          className={`px-4 font-bold ${
            question.answer == 3 && "text-amber-500"
          } ${question.answer > 3 && "text-green-500"} ${
            question.answer < 3 && "text-red-500"
          }`}
        >
          {question.answer}
        </div>
      </div>
      <input
        id="steps-range"
        type="range"
        min="1"
        max="5"
        value={question.answer}
        onChange={handleQuestionChange}
        step="1"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      ></input>
    </form>
  );
};

export default FormSection;
