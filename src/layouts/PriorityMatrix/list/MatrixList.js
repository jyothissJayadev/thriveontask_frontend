import React, { useState } from "react";
import { PlusCircle, ChevronRight } from "lucide-react";
import "./MatrixList.css";

const MatrixList = () => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [items, setItems] = useState([
    {
      id: 1,
      date: "18. mai 2018",
      title: "Uudne lahendus Sinu vara kaitsmiseks",
      details:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu justo nec arcu fermentum varius. Nullam in odio felis. Sed tincidunt, nisl nec aliquet ultrices, leo odio tincidunt orci.",
    },
    {
      id: 2,
      date: "19. aprill 2018",
      title: "Meie turvatöötajate tööst Eesti Tööturukkassa Narva büroos",
      details:
        "Fusce tempor imperdiet nibh, et sodales enim vehicula in. Morbi lacinia sollicitudin justo, a tempus mauris lacinia sed. Duis laoreet viverra nulla, ac convallis dolor scelerisque sed.",
    },
    {
      id: 3,
      date: "7. märts 2018",
      title: "Töö- ja karjäärimess 2018",
      details:
        "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nulla facilisi. Suspendisse potenti. Nulla eget massa eget nisl ultrices consequat.",
    },
    {
      id: 4,
      date: "28. veebruar 2018",
      title: "Eesti Vabariik 100",
      details:
        "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nulla id volutpat neque. Duis euismod, turpis ac varius lobortis, orci enim eleifend arcu.",
    },
  ]);

  const handleCreateMatrix = () => {
    const newItem = {
      id: items.length + 1,
      date: new Date().toLocaleDateString("et-EE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      title: `New Matrix Item ${items.length + 1}`,
      details:
        "This is a newly created matrix item with placeholder details. Click to expand and see more information about this item.",
    };
    setItems([newItem, ...items]);
  };

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <div className="matrix-container">
      <div className="matrix-list">
        {items.map((item) => (
          <div key={item.id} className="matrix-item">
            <div className="matrix-item-header" onClick={() => toggleExpand(item.id)}>
              <div className="matrix-item-content">
                <div className="matrix-item-date">{item.date}</div>
                <h3 className="matrix-item-title">{item.title}</h3>
              </div>
              <div className={`matrix-item-icon ${expandedItem === item.id ? "rotated" : ""}`}>
                <ChevronRight />
              </div>
            </div>

            <div className={`matrix-item-details ${expandedItem === item.id ? "expanded" : ""}`}>
              <p>{item.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatrixList;
