import { useEffect, useState } from "react";
import FormSection from "../components/FormSection";
import { addToAirtable, getTeam, searchForBusiness } from "../lib/Airtable";
import { useRouter } from "next/router";

import { QUESTIONS } from "../lib/Questions";

import Cookies from 'js-cookie'

export default function Home() {
  const router = useRouter();

  const [openStatus, setOpenStatus] = useState(false);

  const [reviewer, setReviewer] = useState("recMrhUbGHq5U2NLc");

  const [company, setCompany] = useState({ name: "", id: "" });

  const [questions, setQuestions] = useState(QUESTIONS);

  const [authenticated, setAuthenticated] = useState(false);

  const questionUpdated = (question) => {
    // console.log(question);

    // need to search through questions object, find the question that has changed and then updated the value
    const updatedQuestionSet = questions.map((section) => {
      const questionsUpdatedWithNewValues = section.questions.map(
        (oldQuestion) => {
          if (oldQuestion.question === question.question) {
            return {
              question: question.question,
              answer: Number(question.answer),
            };
          } else {
            return oldQuestion;
          }
        }
      );
      return {
        section: section.section,
        questions: questionsUpdatedWithNewValues,
      };
    });

    setQuestions(updatedQuestionSet);
  };

  const handleChangeScorer = (e) => {
    // console.log(e.target.value);
    setReviewer(e.target.value);
    getTeam();
  };

  const resetCompany = () => {
    setCompany({ name: "", id: "" });
  };

  const handleAuthentication = (event) => {
    event.preventDefault();
    const form = new FormData(event.target); 
    const formData = Object.fromEntries(form.entries()); 
    console.log(formData);
    if (formData.password == process.env.NEXT_PUBLIC_SITE_PASSWORD) {
      setAuthenticated(true);
      Cookies.set('authenticated', true)
    }
    event.target.reset();
  }

  useEffect(() => {
    if (Cookies.get('authenticated') == "true") {
      setAuthenticated(true)
    } else {
      setAuthenticated(false)
    }
  }, [])

  const handleFullSubmission = async () => {
    if ((reviewer, company)) {
      // console.log(reviewer, company, questions);

      const formattedQuestions = [];
      questions.map((section) => {
        section.questions.map((qu) => {
          formattedQuestions.push({
            question: qu.question,
            answer: String(qu.answer),
          });
        });
        // formattedQuestions.push(...section.questions);
      });
      // questions.map((section) => {
      //   formattedQuestions.push(...section.questions);
      // });
      const newScore = await addToAirtable({
        reviewer,
        company,
        formattedQuestions,
      });
      location.assign(newScore);
    } else {
      alert("Both scorer and company is required.");
    }
  };

  return (
    <main className="h-screen w-full">
      {authenticated ? (
        <div
          id="wrapper"
          className="max-w-3xl mx-auto bg-white p-6 shadow-xl mt-2"
        >
          <div id="inner-wrapper" className="w-[600px] mx-auto">
            {/* headline */}
            <div className="w-full flex items-center justify-center py-4">
              <h1>Ascension Score Sheet</h1>
            </div>
            {/* scorer section */}
            <div className="flex flex-col">
              <label
                htmlFor="scorer"
                className="text-gray-500 font-bold uppercase text-xs pb-1"
              >
                Scorer
              </label>
              <div className="inline-block relative">
                <select
                  name="scorer"
                  id=""
                  onChange={handleChangeScorer}
                  defaultValue="Nico Albanese"
                  className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="recMrhUbGHq5U2NLc">Nico</option>
                  <option value="recjgPNfu8ZOeuoe3">Remy</option>
                  <option value="recX0rr5sM9Ck3jJL">Sonia</option>
                  <option value="recpP3sZcrNfvxvXk">Alex H</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            {/* select company section */}
            {company.name ? (
              <SelectedCompany company={company} resetCompany={resetCompany} />
            ) : (
              <CompanySearch setCompany={setCompany} />
            )}
            {/* question section */}
            <div className="my-6 drop-shadow rounded-md">
              <div className="flex justify-end mb-2">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                  onClick={() => {
                    setOpenStatus(!openStatus);
                  }}
                >
                  {openStatus == true ? "Collapse" : "Expand"}
                </button>
              </div>
              {questions &&
                questions.map((section, i) => (
                  <FormSection
                    key={i}
                    title={section.section}
                    questions={section.questions}
                    openStatus={openStatus}
                    questionUpdated={questionUpdated}
                  />
                ))}
              <div className="w-full py-4 flex items-center justify-center">
                <button
                  onClick={handleFullSubmission}
                  className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <form action="" onSubmit={handleAuthentication}>
            <input
              type="password"
              name="password"
              placeholder="password"
              className="py-2 px-4"
            />
          </form>
        </div>
      )}
    </main>
  );
}

const CompanySearch = ({ setCompany }) => {
  const [results, setResults] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const formData = Object.fromEntries(form.entries());
    // console.log(formData);
    // setCompany(formData.company);
    const results = await searchForBusiness(formData.company);

    if (results != "No businesses found...") {
      setResults(results);
    } else {
      alert("No businesses found with that name. Please try again.");
    }
    console.log(results);

    event.target.reset();
  };

  return (
    <div className="flex flex-col w-[600px] mx-auto pt-4">
      <form className="flex items-center" onSubmit={handleSubmit}>
        <label htmlFor="simple-search" className="sr-only">
          Search
        </label>
        <div className="relative w-full">
          <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            id="simple-search"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Company"
            name="company"
            required
          />
        </div>
        <button
          type="submit"
          className="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
          <span className="sr-only">Company</span>
        </button>
      </form>
      {results.length > 0 && (
        <div id="results-container" className="mt-4">
          {results.map((result, i) => (
            <div
              key={i}
              className="cursor-pointer py-2 hover:opacity-50 border-b-2 border-gray-200"
              onClick={() => setCompany({ name: result.name, id: result.id })}
            >
              {result.name}
            </div>
          ))}
          <div className="text-sm text-gray-500 italic pt-2">
            {results.length} {results.length > 1 ? "results" : "result"} found
          </div>
        </div>
      )}
    </div>
  );
};

const SelectedCompany = ({ company = "Test Company", resetCompany }) => {
  return (
    <div className="flex justify-between py-4">
      <div>
        <div className="uppercase text-gray-500 text-xs">Company</div>
        <div>{company.name}</div>
      </div>
      <button
        onClick={resetCompany}
        className="p-3 bg-red-100 rounded-lg flex hover:opacity-70 items-center justify-center"
      >
        x
      </button>
    </div>
  );
};
