import { Parser } from "./core";
import * as weak from "./weaklytypedbuilder";

export function parse<TI, TO>(parser: Parser<TI, TO>) {
    return weak.parse(parser) as ParserBuilder1<TI, TO>;
}

export interface Constructor1<T1, TR> {
    new (p1: T1) : TR;
}

export interface ParserBuilder1<TI, T1> {
    produce<TR>(con: Constructor1<T1, TR>): Parser<TI, TR>;
    make<TR>(f: (p1: T1) => TR): Parser<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserBuilder2<TI, T1,TN>;
}

export interface Constructor2<T1, T2, TR> {
    new (p1: T1, p2: T2) : TR;
}

export interface ParserBuilder2<TI, T1, T2> {
    produce<TR>(con: Constructor2<T1, T2, TR>): Parser<TI, TR>;
    make<TR>(f: (p1: T1, p2: T2) => TR): Parser<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserBuilder3<TI, T1, T2, TN>;
}

export interface Constructor3<T1, T2, T3, TR> {
    new (p1: T1, p2: T2, p3: T3) : TR;
}

export interface ParserBuilder3<TI, T1, T2, T3> {
    produce<TR>(con: Constructor3<T1, T2, T3, TR>): Parser<TI, TR>;
    make<TR>(f: (p1: T1, p2: T2, p3: T3) => TR): Parser<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserBuilder4<TI, T1, T2, T3, TN>;
}

export interface Constructor4<T1, T2, T3, T4, TR> {
    new (p1: T1, p2: T2, p3: T3, p4: T4) : TR;
}

export interface ParserBuilder4<TI, T1, T2, T3, T4> {
    produce<TR>(con: Constructor4<T1, T2, T3, T4, TR>): Parser<TI, TR>;
    make<TR>(f: (p1: T1, p2: T2, p3: T3, p4: T4) => TR): Parser<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserBuilder5<TI, T1, T2, T3, T4, TN>;
}

export interface Constructor5<T1, T2, T3, T4, T5, TR> {
    new (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5) : TR;
}

export interface ParserBuilder5<TI, T1, T2, T3, T4, T5> {
    produce<TR>(con: Constructor5<T1, T2, T3, T4, T5, TR>): Parser<TI, TR>;
    make<TR>(f: (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5) => TR): Parser<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserBuilder6<TI, T1, T2, T3, T4, T5, TN>;
}

export interface Constructor6<T1, T2, T3, T4, T5, T6, TR> {
    new (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5, p6: T6) : TR;
}

export interface ParserBuilder6<TI, T1, T2, T3, T4, T5, T6> {
    produce<TR>(con: Constructor6<T1, T2, T3, T4, T5, T6, TR>): Parser<TI, TR>;
    make<TR>(f: (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5, p6: T6) => TR): Parser<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserBuilder7<TI, T1, T2, T3, T4, T5, T6, TN>;
}

export interface Constructor7<T1, T2, T3, T4, T5, T6, T7, TR> {
    new (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5, p6: T6, p7: T7) : TR;
}

export interface ParserBuilder7<TI, T1, T2, T3, T4, T5, T6, T7> {
    produce<TR>(con: Constructor7<T1, T2, T3, T4, T5, T6, T7, TR>): Parser<TI, TR>;
    make<TR>(f: (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5, p6: T6, p7: T7) => TR): Parser<TI, TR>;
    //followedBy<TN>(otherParser: Parser<TI, TN>): ParserBuilder8<TI, T1, T2, T3, T4, T5, T6, T7, TN>;
}