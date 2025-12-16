import pytest
from uniapp.crud import subjects_to_mask, mask_to_subjects, SUBJECTS


def test_subjects_to_mask_single():
    mask = subjects_to_mask(["Физика"]) if "Физика" in SUBJECTS else subjects_to_mask([list(SUBJECTS.keys())[0]])
    assert isinstance(mask, int)


def test_subjects_to_mask_multiple():
    keys = list(SUBJECTS.keys())[:3]
    mask = subjects_to_mask(keys)
    assert mask != 0


def test_subjects_to_mask_unknown_ignored():
    mask = subjects_to_mask(["Неизвестный предмет"])
    assert mask == 0


def test_mask_to_subjects_roundtrip():
    keys = list(SUBJECTS.keys())[:4]
    mask = subjects_to_mask(keys)
    names = mask_to_subjects(mask)
    for k in keys:
        assert k in names
