// base - Product.find()
// base - Product.find(email:{'new@new.com'})
//bigQ - //search=coder&page=2&category=shortsleeves&rating[gte]=4&price=[lte]=999&price[gte]=199

class WhereClause {
    constructor(base, bigQ) {
        this.base = base;
        this.bigQ = bigQ;
  };
  search() {
      const searchWord = this.bigQ.search
        ? {
          name: {
            $regex: this.bigQ.search, // word with search=
            $options: "i", // i is for first word with search=
          },
        }
        : {};
        this.base = this.base.find({ ...searchWord });
        return this;
  };
  filter() {
    const copyQ = { ...this.bigQ }; // copy bigQ object with all properites

    delete copyQ["search"]; // delete search from this.base like search=code
    delete copyQ["limit"]; // delete limit from this.base like limit=5
    delete copyQ["page"]; // delete page from this.base  like page=2

    // convert bigQ into a string => copyQ, as regex will only work on strings
    let stringOfCopy = JSON.stringify(copyQ);

    // /\b(gte|lte|gt|lt)\b/g, m => `$${m}` means '\b' is for border area like there can be a word pogte where gte is also present but it will ignore that word beacause it will only find `gte` exact match.
    // find match gte OR lte OR gt OR lt
    // `\b` again or border area.
    // `/g` for globally
    // m => `$${m}` is a callback fn
    // for every match `m`, add `$` in front of match. like $gte , `${m}` will be replaced by match i.e gte.
    stringOfCopy = stringOfCopy.replace(/\b(gte|lte|gt|lt)\b/g, (m) => `$${m}`);
    const jsonOfCopyQ = JSON.parse(stringOfCopy);  
    this.base = this.base.find(jsonOfCopyQ); 
    return this;
  }
  pager(resultPerPage) {
    let currentPage = 1;
    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }

    // skipValue = 5 - (1-1) if we are on fist page and we want 5 results per page.
    const skipValue = resultPerPage * (currentPage - 1);
    this.base = this.base.limit(resultPerPage).skip(skipValue);
    return this;
  }
}

module.exports = WhereClause;

