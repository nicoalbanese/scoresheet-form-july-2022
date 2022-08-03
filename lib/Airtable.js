// const apiKey = "keyLUXLM28pTbdyTx";

var myHeaders = new Headers();
myHeaders.append("Authorization", `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY}`);
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Cookie", "brw=brwy1TrDiZyNAsU5u");

export const searchForBusiness = async (name) => {
  console.log("search function called for", name);

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const res = await fetch(
    `https://api.airtable.com/v0/apptcOM65nkIWJy1l/Pipeline?filterByFormula=SEARCH("${name.toLowerCase()}", lower({Company}))`,
    requestOptions
  );
  console.log("res", res);
  const data = await res.json();
  console.log("data", data);

  const formattedData = data.records.map((company) => {
    return formatBusiness(company);
  });

  if (data.records.length < 1) {
    return "No businesses found...";
  }
  return formattedData;
};

const formatBusiness = (rawBusiness) => {
  const fields = rawBusiness.fields;
  return {
    name: fields["Company"],
    description: fields["Description"],
    website: fields["Website (for extension)"],
    recordUrl: `https://airtable.com/apptcOM65nkIWJy1l/tblltzjPiwy7gOkKE/viwg63PSZQ8mWWeID/${rawBusiness["id"]}?blocks=hide`,
    id: rawBusiness["id"],
    lastStatusChange: fields["Last Status Change"].error
      ? null
      : fields["Last Status Change"],
  };
};

export const addToAirtable = async (newScore) => {
  console.log(newScore);

  const formatted = {};
  newScore.formattedQuestions.map((question) => {
    formatted[question.question] = question.answer;
  });

  var raw = JSON.stringify({
    records: [
      {
        fields: {
          Company: [newScore.company.id],
          Scorer: [newScore.reviewer],
          ...formatted,
        },
      },
    ],
  });

  console.log(raw);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  const res = await fetch(
    "https://api.airtable.com/v0/apptcOM65nkIWJy1l/Investment%20Score",
    requestOptions
  );
  const data = await res.json();
  console.log(data.records[0].id);
  // // return `https://api.airtable.com/v0/apptcOM65nkIWJy1l/Investment%20Score/${data.records[0].id}?blocks=hide`;
};

export const getTeam = async (name) => {
  console.log("search function called for", name);

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const res = await fetch(
    `https://api.airtable.com/v0/apptcOM65nkIWJy1l/Ascension%20Team`,
    requestOptions
  );
  console.log("res", res);
  const data = await res.json();
  console.log("data", data);

  const formattedData = data.records.map((company) => {
    return formatName(company);
  });

  if (data.records.length < 1) {
    return "No businesses found...";
  }
  return formattedData;
};

const formatName = (rawBusiness) => {
  const fields = rawBusiness.fields;
  return {
    name: fields["Name"],
    id: rawBusiness["id"],
  };
};
