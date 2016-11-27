import { Parser } from "./core";
import { ParserBuilder } from "./ParserBuilder";

export interface Constructor1<T1, TR> {
    new (p1: T1) : TR;
}

export interface ParserChainBuilder1<TI, T1> {
    produce<TR>(con: Constructor1<T1, TR>): ParserBuilder<TI, TR>;
    adopt<TR>(f: (p1: T1) => TR): ParserBuilder<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserChainBuilder2<TI, T1, TN>; // TODO: soften type req to Parser<TI, TN>?
}

export interface Constructor2<T1, T2, TR> {
    new (p1: T1, p2: T2) : TR;
}

export interface ParserChainBuilder2<TI, T1, T2> {
    produce<TR>(con: Constructor2<T1, T2, TR>): ParserBuilder<TI, TR>;
    adopt<TR>(f: (p1: T1, p2: T2) => TR): ParserBuilder<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserChainBuilder3<TI, T1, T2, TN>;
}

export interface Constructor3<T1, T2, T3, TR> {
    new (p1: T1, p2: T2, p3: T3) : TR;
}

export interface ParserChainBuilder3<TI, T1, T2, T3> {
    produce<TR>(con: Constructor3<T1, T2, T3, TR>): ParserBuilder<TI, TR>;
    adopt<TR>(f: (p1: T1, p2: T2, p3: T3) => TR): ParserBuilder<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserChainBuilder4<TI, T1, T2, T3, TN>;
}

export interface Constructor4<T1, T2, T3, T4, TR> {
    new (p1: T1, p2: T2, p3: T3, p4: T4) : TR;
}

export interface ParserChainBuilder4<TI, T1, T2, T3, T4> {
    produce<TR>(con: Constructor4<T1, T2, T3, T4, TR>): ParserBuilder<TI, TR>;
    adopt<TR>(f: (p1: T1, p2: T2, p3: T3, p4: T4) => TR): ParserBuilder<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserChainBuilder5<TI, T1, T2, T3, T4, TN>;
}

export interface Constructor5<T1, T2, T3, T4, T5, TR> {
    new (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5) : TR;
}

export interface ParserChainBuilder5<TI, T1, T2, T3, T4, T5> {
    produce<TR>(con: Constructor5<T1, T2, T3, T4, T5, TR>): ParserBuilder<TI, TR>;
    adopt<TR>(f: (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5) => TR): ParserBuilder<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserChainBuilder6<TI, T1, T2, T3, T4, T5, TN>;
}

export interface Constructor6<T1, T2, T3, T4, T5, T6, TR> {
    new (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5, p6: T6) : TR;
}

export interface ParserChainBuilder6<TI, T1, T2, T3, T4, T5, T6> {
    produce<TR>(con: Constructor6<T1, T2, T3, T4, T5, T6, TR>): ParserBuilder<TI, TR>;
    adopt<TR>(f: (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5, p6: T6) => TR): ParserBuilder<TI, TR>;
    followedBy<TN>(otherParser: Parser<TI, TN>): ParserChainBuilder7<TI, T1, T2, T3, T4, T5, T6, TN>;
}

export interface Constructor7<T1, T2, T3, T4, T5, T6, T7, TR> {
    new (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5, p6: T6, p7: T7) : TR;
}

export interface ParserChainBuilder7<TI, T1, T2, T3, T4, T5, T6, T7> {
    produce<TR>(con: Constructor7<T1, T2, T3, T4, T5, T6, T7, TR>): ParserBuilder<TI, TR>;
    adopt<TR>(f: (p1: T1, p2: T2, p3: T3, p4: T4, p5: T5, p6: T6, p7: T7) => TR): ParserBuilder<TI, TR>;
    // followedBy<TN>(otherParser: Parser<TI, TN>): ParserChainBuilder8<TI, T1, T2, T3, T4, T5, T6, T7, TN>;
}
