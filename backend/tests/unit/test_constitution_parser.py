"""Parser tests use FICTIONAL text laid out like the source PDF; no real law appears in fixtures."""
from app.legal.ingestion.constitution import (
    parse_articles, reflow, split_clause_rights, split_page, effective_date_from_commencement,
)

RULE = "_" * 40

PAGE_1 = f"""7
PART X
EXAMPLE RIGHTS
General
1. Definition.—In this Part, "the Realm" means the Example Realm.
Right to Equality
2. Right to quiet.—The Realm shall not make noise in any person's garden.
THE CONSTITUTION OF INDIA (Part X.—Example Rights) 8
3. Freedoms.—(1) All residents shall have the right—
(a) to sing in the shade;
(b) to dance without shoes;
1[(c) to whistle]
2[(d)* * * * *]
(2) Nothing in clause (1) limits the Realm.
{RULE}
1. Ins. by the Example (First) Act, 2001, s. 2.
2. Omitted by the Example (Second) Act, 2002.
"""

PAGE_2 = """8
Right to Freedom
4. Right to nap.—Every person may nap
between noon and one.
1[4A. Right to tea.—Every person may take tea.]
"""


def pages():
    return [split_page(1, PAGE_1), split_page(2, PAGE_2)]


def test_split_page_separates_footnotes_and_drops_headers():
    p = split_page(1, PAGE_1)
    assert "Ins. by" not in p.body and "THE CONSTITUTION OF INDIA" not in p.body
    assert p.footnotes["1"].startswith("Ins. by") and p.footnotes["2"].startswith("Omitted")


def test_parse_articles_in_order_with_groups_headings_and_footnotes():
    arts = {a.number: a for a in parse_articles(pages(), ["1", "2", "3", "4", "4A"])}
    assert arts["1"].heading == "Definition" and arts["1"].group_heading == "General"
    assert arts["2"].group_heading == "Right to Equality" and arts["4"].group_heading == "Right to Freedom"
    assert arts["4"].text == "Every person may nap between noon and one."
    assert arts["4A"].heading == "Right to tea"
    assert [m for m, _ in arts["3"].amendments] == ["1", "2"]
    assert arts["3"].pages == [1]


def test_missing_article_fails_loudly_instead_of_guessing():
    import pytest
    with pytest.raises(ValueError, match="Article 9 not found"):
        parse_articles(pages(), ["1", "9"])


def test_split_clause_rights_lists_each_sub_clause_and_flags_omitted():
    art = parse_articles(pages(), ["1", "2", "3", "4", "4A"])[2]
    rows = split_clause_rights(art.text, "1")
    assert [r[0] for r in rows] == ["a", "b", "c", "d"]
    assert rows[0][1] == "to sing in the shade;"
    assert rows[3][2] is True and rows[0][2] is False


def test_reflow_keeps_clauses_on_their_own_line():
    assert reflow("(1) first part\ncontinues here\n(2) second") == "(1) first part continues here\n(2) second"


def test_effective_date_is_parsed_only_from_commencement_text():
    text = "shall come into force on the twenty-sixth day of January, 1950, which day"
    assert effective_date_from_commencement(text) == "1950-01-26"
    assert effective_date_from_commencement("nothing to see") is None
