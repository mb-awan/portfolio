"use client";
import React from "react";
import Link from "next/link";
import "./navbar.scss";
import Image from "next/image";
import clsx from "clsx";

const Navbar = () => {
  const navLinks = [
    {
      title: "About Me",
      href: "#",
    },
    {
      title: "Projects",
      href: "#",
    },
    {
      title: "Education",
      href: "#",
    },
    {
      title: "Contact Me",
      href: "#",
    },
  ];

  const [activeLink, setActiveLink] = React.useState(0);

  console.log("activeLink", activeLink);
  return (
    <div className="navbar">
      <div className="navbar__logo">
        <Link href="/" className="navbar__link">
          <Image src="/logo.png" width="150" height="150" alt="logo" />
        </Link>
      </div>
      <div className="navbar__menu__left">
        {navLinks?.map((link, index) => (
          <div
            key={index}
            className="navbar__menu__item"
            onClick={() => setActiveLink(index)}
          >
            <Link
              href={link.href}
              className={clsx("navbar__link", { active: activeLink === index })}
            >
              {link.title}
            </Link>
          </div>
        ))}
      </div>
      <div className="navbar__menu__right">
        <div className="navbar__btn">Register</div>
        <div className="navbar__btn">Login</div>
      </div>
    </div>
  );
};

export default Navbar;
