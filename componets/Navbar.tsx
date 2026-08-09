import React from 'react';
import {Box} from "lucide-react";
import Button from "./ui/Button";

const Navbar = () => {
    const isSignedIn=true;
    const userName = "Seif";
    const  handleAuthClick = async () => {}

    return (
        <header className ="navbar">
            <nav className="inner">
                <div className="left">
                    <div className ="brand">
                    <Box className="logo"/>
                        <span className ="Name">
                            Roomify
                        </span>
                    </div>

                    <ul className="links">
                    <a href = "#">Product</a>
                    <a href = "#">Pricing</a>
                    <a href = "#">Community</a>
                    <a href = "#">Enterprise</a>
                    </ul>
                </div>

                <div className="actions">
                    {isSignedIn ? (
                        <>
                    <span className="greeting">
                        {userName ? `Hi, ${userName}` : 'Signed In'}
                    </span>
                            <Button
                                onClick={handleAuthClick}
                                size="sm"
                                className ="btn">
                                Log out
                            </Button>
                        </>

                    ):(
                        <>
                    <Button
                    onClick={handleAuthClick}
                        size="sm"
                    variant="ghost">
                        Log in
                    </Button>
                    <a href="#upload" className="cta">Get Started</a>
                        </>
                    )}

                </div>
            </nav>
        </header>
    );
};

export default Navbar;