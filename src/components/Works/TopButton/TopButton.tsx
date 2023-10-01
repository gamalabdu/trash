import React, { SetStateAction, useEffect, useState } from 'react';
import './styles.css';

interface ITopButtonProps {
  buttonName: string;
  setCategories: React.Dispatch<SetStateAction<string[]>>;
  categories: string[];
}

const TopButton: React.FC<ITopButtonProps> = ({ buttonName, setCategories, categories }) => {

  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    setButtonClicked(categories.includes(buttonName));
  }, [categories, buttonName]);


  // this is where I try to make it happen


  const allOtherButtonsHighlighted = categories.every((category) => category !== 'Everything') && categories.length >= 7


  useEffect (() => {

    if ( categories.length >= 7 || categories.length === 0 ) {

      setCategories(['Everything'])

    }

  },
  [allOtherButtonsHighlighted, categories.length, setCategories])


  ///////////


  const handleClick = () => {
    if (buttonName === 'Everything') {
      if (categories.length === 1 && categories.includes('Everything')) {
        setCategories([]);
      } else {
        setCategories(['Everything']);
      }
    } else {
      const updatedCategories = categories.includes('Everything') ? [] : [...categories];
      if (updatedCategories.includes(buttonName)) {
        updatedCategories.splice(updatedCategories.indexOf(buttonName), 1);
      } else {
        updatedCategories.push(buttonName);
      }
      setCategories(updatedCategories);
    }
    setButtonClicked(!buttonClicked);
  };

  return (
    <div onClick={handleClick} className={buttonClicked ? 'buttons-clicked' : 'buttons'}>
      {buttonName}
    </div>
  );
};

export default TopButton;









